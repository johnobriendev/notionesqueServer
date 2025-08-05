// src/models/prisma.ts
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../services/encryptionService';

const prisma = new PrismaClient().$extends({
  result: {
    project: {
      // Override the original 'name' property with the decrypted version
      name: {
        needs: { name: true },
        compute(project) {
          return decrypt(project.name) || project.name;
        },
      },
      // Override the original 'description' property with the decrypted version
      description: {
        needs: { description: true },
        compute(project) {
          return decrypt(project.description) || project.description;
        },
      },
    },
    task: {
      // Override the original 'title' property with the decrypted version
      title: {
        needs: { title: true },
        compute(task) {
          return decrypt(task.title) || task.title;
        },
      },
      // Override the original 'description' property with the decrypted version
      description: {
        needs: { description: true },
        compute(task) {
          return decrypt(task.description) || task.description;
        },
      },
    },
  },
  query: {
    project: {
      create({ args, query }) {
        if (args.data.name) {
          args.data.name = encrypt(args.data.name) || args.data.name;
        }
        if (args.data.description) {
          args.data.description = encrypt(args.data.description) || args.data.description;
        }
        return query(args);
      },
      update({ args, query }) {
        if (args.data.name) {
          args.data.name = encrypt(args.data.name as string) || args.data.name;
        }
        if (args.data.description) {
          args.data.description = encrypt(args.data.description as string) || args.data.description;
        }
        return query(args);
      },
      upsert({ args, query }) {
        if (args.create.name) {
          args.create.name = encrypt(args.create.name) || args.create.name;
        }
        if (args.create.description) {
          args.create.description = encrypt(args.create.description) || args.create.description;
        }
        if (args.update.name) {
          args.update.name = encrypt(args.update.name as string) || args.update.name;
        }
        if (args.update.description) {
          args.update.description = encrypt(args.update.description as string) || args.update.description;
        }
        return query(args);
      },
    },
    task: {
      create({ args, query }) {
        if (args.data.title) {
          args.data.title = encrypt(args.data.title) || args.data.title;
        }
        if (args.data.description) {
          args.data.description = encrypt(args.data.description) || args.data.description;
        }
        return query(args);
      },
      update({ args, query }) {
        if (args.data.title) {
          args.data.title = encrypt(args.data.title as string) || args.data.title;
        }
        if (args.data.description) {
          args.data.description = encrypt(args.data.description as string) || args.data.description;
        }
        return query(args);
      },
      upsert({ args, query }) {
        if (args.create.title) {
          args.create.title = encrypt(args.create.title) || args.create.title;
        }
        if (args.create.description) {
          args.create.description = encrypt(args.create.description) || args.create.description;
        }
        if (args.update.title) {
          args.update.title = encrypt(args.update.title as string) || args.update.title;
        }
        if (args.update.description) {
          args.update.description = encrypt(args.update.description as string) || args.update.description;
        }
        return query(args);
      },
    },
  },
});

export default prisma;