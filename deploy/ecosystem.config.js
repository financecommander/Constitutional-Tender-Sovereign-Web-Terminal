module.exports = {
  apps: [
    {
      name: 'ct-api',
      cwd: '/opt/ct/apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/ct/api-error.log',
      out_file: '/var/log/ct/api-out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      name: 'ct-web',
      cwd: '/opt/ct/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/ct/web-error.log',
      out_file: '/var/log/ct/web-out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
