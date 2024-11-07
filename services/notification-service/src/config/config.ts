import * as process from 'node:process';

export default () => ({
  rabbitmqUrl: process.env.RABBITMQ_URL,
  port: parseInt(process.env.LOCAL_PORT, 10),
  nodemailerUsername: process.env.NODEMAILER_USERNAME,
  nodemailerPassword: process.env.NODEMAILER_PASSWORD,
  nodemailerHost: process.env.NODEMAILER_HOST,
  nodemailerPort: parseInt(process.env.NODEMAILER_PORT, 10),
});
