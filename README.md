# Installation guide

```
$ make build

## Execute this if other hosts cannot login to mysql
$ ./scripts/mysql -h db -u root -ppwdnac255
$ ALTER USER 'node'@'%' IDENTIFIED WITH mysql_native_password BY 'pwdnac255';
```

