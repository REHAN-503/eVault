const gateway = require('./dist/index.js');

const docId = '55555555-5555-4555-8555-555555555555';
const userId = '66666666-6666-4666-8666-666666666666';

async function main() {
  try {
    console.log('\n1. logAction');
    console.log(
      await gateway.logAction(
        docId,
        userId,
        'DOCUMENT_VIEWED'
      )
    );

    console.log('\n2. getAuditTrail');

    // If getAuditTrail is exported by the gateway:
    console.log(
      await gateway.getAuditTrail(
        docId
      )
    );

    console.log('\nGATEWAY AUDIT TEST SUCCESS');
  } catch (err) {
    console.error('\nGATEWAY AUDIT TEST FAILED');
    console.error(err);
    process.exitCode = 1;
  } finally {
    gateway.closeConnection();
  }
}

main();
