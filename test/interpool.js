const tape = require('tape');
const mock = require('./mock');

const TEST_KEY = '@pAhDcHjunq6epPvYYo483vBjcuDkE10qrc2tYC827R0=.ed25519';
const TEST_ADDR =
  'net:localhost:9752~shs:pAhDcHjunq6epPvYYo483vBjcuDkE10qrc2tYC827R0=';
const TEST_ADDR2 =
  'net:localhost:1234~shs:pAhDcHjunq6epPvYYo483vBjcuDkE10qrc2tYC827R0=';

tape('CONN refuses to stage an already connected address', t => {
  t.plan(4);
  const ssb = mock();

  const address = TEST_ADDR;
  ssb.conn.connect(address, (err, result) => {
    t.error(err, 'no error');
    t.ok(result, 'connect was succesful');

    const stagingResult = ssb.conn.stage(address, {mode: 'internet'});
    t.equals(stagingResult, false, 'stage() should refuse');

    const entries1 = Array.from(ssb.conn.staging().entries());
    t.equals(entries1.length, 0, 'there is nothing in staging');

    t.end();
  });
});

tape('CONN refuses to stage an ssb key that already has a connection', t => {
  t.plan(4);
  const ssb = mock();

  ssb.conn.connect(TEST_ADDR, {key: TEST_KEY}, (err, result) => {
    t.error(err, 'no error');
    t.ok(result, 'connect was succesful');

    const stagingResult = ssb.conn.stage(TEST_ADDR2, {
      mode: 'internet',
      key: TEST_KEY,
    });
    t.equals(stagingResult, false, 'stage() should refuse');

    const entries1 = Array.from(ssb.conn.staging().entries());
    t.equals(entries1.length, 0, 'there is nothing in staging');

    t.end();
  });
});

tape('automatically unstage upon connHub "connected" event', t => {
  t.plan(6);
  const ssb = mock();

  const address = TEST_ADDR;
  const result1 = ssb.conn.stage(address, {mode: 'internet', address});
  t.equals(result1, true, 'stage() succeeds');

  const entries1 = Array.from(ssb.conn.staging().entries());
  t.equals(entries1.length, 1, 'there is one address in staging');
  const [actualAddress] = entries1[0];
  t.equals(actualAddress, TEST_ADDR, 'staged address is what we expected');

  ssb.conn.connect(address, (err, result) => {
    t.error(err, 'no error');
    t.ok(result, 'connect was succesful');

    const entries2 = Array.from(ssb.conn.staging().entries());
    t.equals(entries2.length, 0, 'there is nothing in staging');

    t.end();
  });
});
