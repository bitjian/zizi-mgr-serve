const { ctx } = this;
const { __softinfo: sofinfo, softHelper } = ctx;
const { sumeruServerConfig, getSumeruServerIpPort } = softHelper;
const { buildEnv } = ctx.request.query;
const isRelease = (buildEnv || 'test') === 'release' ? 1 : 0;
const cnf = sumeruServerConfig[`${isRelease ? '' : 'test_'}soft_sync`];
const { data: ipList } = await getSumeruServerIpPort(cnf);
const user = ctx.session.user ? ctx.session.user.LoginName : 'sysAuto';

const pack = (v, format = 'uint8') => {
  const vType = typeof v;
  if (vType !== 'number' && vType !== 'string') return false;
  if (vType === 'string') return Buffer.from(v);

  const t = /^(u)?int(\d+)((l|b)e)?$/;
  const m = format.match(t);

  if (!m) return false;

  const [, it, bs, et] = m;
  const buff = Buffer.allocUnsafe(parseInt(bs) / 8);
  const mt = `write${(it || '').toLocaleUpperCase()}Int${bs}${(et || '').toLocaleUpperCase()}`;
  buff[mt](v);
  return buff;
}

const _packKey = (key, type) => {
  key = key + String.fromCharCode(0);
  const buff1 = pack(key.length, 'uint16be');
  const buff2 = pack(key);
  const buff3 = pack(type);
  const buff4 = pack(1);
  return Buffer.concat([buff1, buff2, buff3, buff4]);
}

const _packValue = (value, type) => {
  switch (type) {
    case 13:
      {
        value = value + String.fromCharCode(0);
        const buff1 = pack(value.length, 'uint32be');
        const buff2 = pack(value);
        return Buffer.concat([buff1, buff2]);
      }
    case 6:
      return pack(value, 'uint32le');
  }
};

const res = await Promise.all(ipList.map(info => {
  const ip = info.inner_ip;
  const port = parseInt(info.port);
  const cmd = cnf.cmd;
  const input = {
    Operator: user || '',
    operator: user || '',
    byadmin: 1,
  };
  const keys = {
    operator: 13,
    byadmin: 6,
  };
  const inputArray = Object.keys(input).map(k => {
    const lk = k.toLocaleLowerCase();
    const type = keys[lk];
    const val = input[k];
    return {
      KEY: k,
      VAL: val,
      TYPE: type,
    }
  });

  const b = pack(inputArray.length, 'uint32be');
  const kvb = inputArray.map(n => {
    const bk = _packKey(n.KEY, n.TYPE);
    const bv = _packValue(n.VAL, n.TYPE);
    return Buffer.concat([bk, bv]);
  });
  let v = kvb[0];
  kvb.forEach((n, i) => {
    if (i === 0) return;
    v = Buffer.concat([v, n]);
  });
  const bbody = Buffer.concat([b, v]);
  const hb1 = pack(101, 'uint32be');
  const hb2 = pack(19781224, 'uint32be');
  const hb3 = pack(0, 'uint32be');
  const hb4 = pack(0, 'uint32be');
  const hb5 = pack(52 + bbody.length, 'uint32be');
  const hb6 = pack('0000000000000000');
  const hb7 = pack(cmd, 'uint32be');
  const hb8 = pack(0, 'uint32be');
  const hb9 = pack(0, 'uint32be');
  const hb10 = pack(0, 'uint32be');
  const bheader = Buffer.concat([hb1, hb2, hb3, hb4, hb5, hb6, hb7, hb8, hb9, hb10]);
  const sendBuf = Buffer.concat([bheader, bbody]);

  return new Promise(r => {
    const dgram = require('dgram');
    const client = dgram.createSocket('udp4');
    client.connect(port, ip, function (err) {
      if (err) console.error(err);
      client.send(sendBuf, function (err, bytes) {
        if (err) throw err;
        console.log(`UDP message sent to ${ip}:${port}`, sendBuf.join(','), bytes);
      });
    });

    client.on('message', function (msg, rinfo) {
      const suc = `${rinfo.address}:${rinfo.port}：${msg}`;
      r({ code: 0, data: { ip, port, msg: suc } });
      client.close();
    });

    client.on('error', function (err) {
      r({ code: 1, err, data: { port, ip } });
      client.close();
    });
  });
}));

ctx.success(res);