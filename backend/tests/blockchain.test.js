'use strict';

const blockchainService = require('../src/services/blockchain/blockchain.service');
const userRepository = require('../src/repositories/userRepository');
const { v4: uuidv4 } = require('uuid');

jest.mock('../src/repositories/userRepository');

describe('Blockchain Service API', () => {
  const validOwnerId = uuidv4();
  const validTargetUserId = uuidv4();
  const validDocId = uuidv4();
  const dummyHash = 'dummyhash123';
  const dummyMetadata = { filename: 'test.pdf', mimetype: 'application/pdf', sizeBytes: 1024 };

  beforeEach(() => {
    blockchainService.resetMockState();
    jest.clearAllMocks();

    userRepository.findById.mockImplementation(async (id) => {
      if (id === validOwnerId) {
        return { id, role: 'LAWYER' };
      }
      if (id === validTargetUserId) {
        return { id, role: 'CLIENT' };
      }
      return null;
    });
  });

  describe('Validation', () => {
    it('should throw validation error on invalid UUIDs', async () => {
      await expect(
        blockchainService.recordDocument('invalid', dummyHash, dummyMetadata, validOwnerId)
      ).rejects.toThrow('Invalid document ID format');
      await expect(
        blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, 'invalid')
      ).rejects.toThrow('Invalid owner ID format');
    });

    it('should throw validation error on invalid permissions', async () => {
      // Need a document first
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await expect(
        blockchainService.grantAccess(validDocId, validTargetUserId, 'INVALID_PERM')
      ).rejects.toThrow('Invalid permission type');
    });

    it('should throw validation error on invalid roles during registration', async () => {
      await expect(blockchainService.registerUser(validOwnerId, 'SUPER_USER')).rejects.toThrow(
        'Invalid user role'
      );
    });
  });

  describe('Automatic Registration', () => {
    it('should auto-register user on recordDocument if not registered', async () => {
      const result = await blockchainService.recordDocument(
        validDocId,
        dummyHash,
        dummyMetadata,
        validOwnerId
      );
      expect(result.docId).toBe(validDocId);
      expect(result.txId).toBeDefined();
      expect(userRepository.findById).toHaveBeenCalledWith(validOwnerId);
    });

    it('should fail auto-registration if user does not exist in repository', async () => {
      const unknownUserId = uuidv4();
      await expect(
        blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, unknownUserId)
      ).rejects.toThrow('Unknown user');
    });

    it('should auto-register user on grantAccess if not registered (grant before registration)', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      // Clear mocks to see if findById is called again for target user
      userRepository.findById.mockClear();

      const result = await blockchainService.grantAccess(validDocId, validTargetUserId, 'READ');
      expect(result.permission).toBe('READ');
      expect(userRepository.findById).toHaveBeenCalledWith(validTargetUserId);
    });

    it('should not auto-register user on grantAccess if already registered (grant after registration)', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await blockchainService.registerUser(validTargetUserId, 'CLIENT');
      userRepository.findById.mockClear();

      const result = await blockchainService.grantAccess(validDocId, validTargetUserId, 'READ');
      expect(result.permission).toBe('READ');
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should not register the same user twice (idempotency in ensureUserRegistered)', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      const secondDocId = uuidv4();
      await blockchainService.recordDocument(secondDocId, dummyHash, dummyMetadata, validOwnerId);

      // Should only have queried the repo once for this user
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('Duplicate Handling', () => {
    it('should throw conflict on duplicate registration', async () => {
      await blockchainService.registerUser(validOwnerId, 'LAWYER');
      await expect(blockchainService.registerUser(validOwnerId, 'LAWYER')).rejects.toThrow(
        'User is already registered on the blockchain'
      );
    });

    it('should throw conflict on duplicate document recording', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await expect(
        blockchainService.recordDocument(validDocId, 'newhash', dummyMetadata, validOwnerId)
      ).rejects.toThrow('Document is already recorded');
    });

    it('should throw conflict on duplicate grant', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await blockchainService.grantAccess(validDocId, validTargetUserId, 'READ');
      await expect(
        blockchainService.grantAccess(validDocId, validTargetUserId, 'READ')
      ).rejects.toThrow('Access already granted with this permission');
    });

    it('should allow grant if permission is different (update)', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await blockchainService.grantAccess(validDocId, validTargetUserId, 'READ');
      const res = await blockchainService.grantAccess(validDocId, validTargetUserId, 'WRITE');
      expect(res.permission).toBe('WRITE');
    });
  });

  describe('Missing / Revoke Handling', () => {
    it('should throw error when granting access to missing document', async () => {
      await expect(
        blockchainService.grantAccess(validDocId, validTargetUserId, 'READ')
      ).rejects.toThrow('Document not found on blockchain');
    });

    it('should throw error on revoking non-existent access', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await expect(blockchainService.revokeAccess(validDocId, validTargetUserId)).rejects.toThrow(
        'Access not found to revoke'
      );
    });

    it('should successfully revoke access', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await blockchainService.grantAccess(validDocId, validTargetUserId, 'READ');

      const hasAccessBefore = await blockchainService.checkAccess(validDocId, validTargetUserId);
      expect(hasAccessBefore).toBe(true);

      await blockchainService.revokeAccess(validDocId, validTargetUserId);

      const hasAccessAfter = await blockchainService.checkAccess(validDocId, validTargetUserId);
      expect(hasAccessAfter).toBe(false);
    });

    it('should throw error on duplicate revokes', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      await blockchainService.grantAccess(validDocId, validTargetUserId, 'READ');

      // First revoke succeeds
      await blockchainService.revokeAccess(validDocId, validTargetUserId);

      // Second revoke fails
      await expect(blockchainService.revokeAccess(validDocId, validTargetUserId)).rejects.toThrow(
        'Access not found to revoke'
      );
    });
  });

  describe('Document Updates and History', () => {
    it('should track version history on updates', async () => {
      await blockchainService.recordDocument(validDocId, dummyHash, dummyMetadata, validOwnerId);
      const updateMeta = { ...dummyMetadata, version: 2 };
      await blockchainService.updateDocument(validDocId, 'hash2', updateMeta);

      const history = await blockchainService.getVersionHistory(validDocId);
      expect(history.length).toBe(2);
      expect(history[0].hash).toBe(dummyHash);
      expect(history[1].hash).toBe('hash2');

      const current = await blockchainService.getDocument(validDocId);
      expect(current.hash).toBe('hash2');
    });

    it('should throw error when updating missing document', async () => {
      await expect(
        blockchainService.updateDocument(validDocId, 'hash', { version: 2 })
      ).rejects.toThrow('Document not found');
    });
  });
});
