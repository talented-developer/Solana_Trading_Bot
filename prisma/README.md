# How to 
https://docs.nestjs.com/recipes/prisma#set-up-prisma

With your Prisma models in place, you can generate your SQL migration files and run them against the database. Run the following commands in your terminal:

```sh
npx prisma migrate dev --name init
```
```sh
npx prisma generate
```



Note that during installation, Prisma automatically invokes the `prisma generate` command for you. In the future, you need to run this command after every change to your Prisma models to update your generated Prisma Client.