export default () => ({
  rabbitmqUrl: process.env.RABBITMQ_URL,
  port: process.env.LOCAL_PORT,
  usersServiceUrl: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
});
