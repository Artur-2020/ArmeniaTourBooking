import * as process from 'node:process';

export default () => ({
  rabbitmqUrl: process.env.RABBITMQ_URL,
  port: parseInt(process.env.LOCAL_PORT, 10),
});
