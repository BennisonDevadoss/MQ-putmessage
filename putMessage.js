'use strict';

const fs = require('fs');
const readline = require('readline');
var mq = require('ibmmq');
var MQC = mq.MQC; // Want to refer to this export directly for simplicity

// The queue manager and queue to be used. These can be overridden on command line.
var qMgr = 'QM1';
var qName = 'DEV.QUEUE.1';

function formatErr(err) {
  return 'MQ call failed in ' + err.message;
}
let trakTesting = 0;

function toHexString(byteArray) {
  return byteArray.reduce(
    (output, elem) => output + ('0' + elem.toString(16)).slice(-2),
    ''
  );
}

var mqmd = new mq.MQMD();
var pmo = new mq.MQPMO();
pmo.Options =
  MQC.MQPMO_NO_SYNCPOINT | MQC.MQPMO_NEW_MSG_ID | MQC.MQPMO_NEW_CORREL_ID;

function putMessage(hObj, hConn) {
  var msg;
  const filename = './validOutputAirlinesData-20-08-22.txt';
  const fileStream = fs.createReadStream(filename);
  var lineReader = readline.createInterface({
    input: fileStream
  });

  lineReader.on('line', (line, lineCount, byteCount) => {
    setTimeout(() => {
      msg = line;
      mq.PutSync(hObj, mqmd, pmo, msg, function (err) {
        console.log(
          'TOTAL NUMBER(S) OF SENT MESSAGES ARE 🚀 %d 🚀',
          ++trakTesting
        );
        console.log(
          '----------------------------------------------------**********************-----------------------------------------------------'
        );
        console.log(msg);
        console.log(
          '----------------------------------------------------**********************-----------------------------------------------------'
        );
        if (err) {
          process.exit();
        } else {
          console.log('MsgId: ' + toHexString(mqmd.MsgId));
          console.log('MQPUT successful');
        }
      });
    }, 1000);
  });
  lineReader.on('close', () => {});
}

function cleanup(hConn, hObj) {
  mq.Close(hObj, 0, function (err) {
    if (err) {
      console.log(formatErr(err));
    } else {
      console.log('MQCLOSE successful');
    }
    mq.Disc(hConn, function (err) {
      if (err) {
        console.log(formatErr(err));
      } else {
        console.log('MQDISC successful');
      }
    });
  });
}

console.log('Sample AMQSPUT.JS start');

var myArgs = process.argv.slice(2); // Remove redundant parms
if (myArgs[0]) {
  qName = myArgs[0];
}
if (myArgs[1]) {
  qMgr = myArgs[1];
}

var cno = new mq.MQCNO();
// cno.Options = MQC.MQCNO_NONE; // use MQCNO_CLIENT_BINDING to connect as client
cno.Options = MQC.MQCNO_CLIENT_BINDING;

if (true) {
  var csp = new mq.MQCSP();
  csp.UserId = 'app';
  csp.Password = 'bennison';
  cno.SecurityParms = csp;
}
if (true) {
  var csd = new mq.MQCD();
  csd.ChannelName = 'DEV.APP.SVRCONN';

  csd.ConnectionName = 'localhost(1414)';
  cno.ClientConn = csd;
}

mq.Connx(qMgr, cno, function (err, hConn) {
  if (err) {
    console.log(err);
    console.log(formatErr(err));
  } else {
    console.log('Working!');
    console.log('MQCONN to %s successful ', qMgr);

    var od = new mq.MQOD();
    od.ObjectName = qName;
    od.ObjectType = MQC.MQOT_Q;
    var openOptions = MQC.MQOO_OUTPUT;
    mq.Open(hConn, od, openOptions, function (err, hObj) {
      if (err) {
        console.log(formatErr(err));
      } else {
        console.log('MQOPEN of %s successful', qName);
        putMessage(hObj, hConn);
      }
      // cleanup(hConn, hObj);
    });
  }
});
