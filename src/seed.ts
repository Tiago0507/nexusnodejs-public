import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './modules/user/role.model';
import User from './modules/user/user.model';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedDatabase = async () => {
  if (!MONGO_URI) {
    console.error("🔴 Error: La variable MONGO_URI no está definida en el archivo .env.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB para el proceso de seeder.");

    const rolesToCreate = [
      {
        name: 'admin',
        description: 'Superusuario con acceso total al sistema.',
        permissions: ["manage_users", "manage_roles", "create_event", "edit_event", "delete_event"]
      },
      {
        name: 'organizer',
        description: 'Usuario regular que puede crear y gestionar sus propios eventos.',
        permissions: ["create_event", "edit_event", "delete_event"]
      },
      {
        name: 'buyer',
        description: 'Usuario regular que puede comprar boletos para eventos.',
        permissions: ["buy_ticket", "view_purchases"]
      }
    ];

    console.log("🔧 Verificando y creando roles...");
    for (const roleData of rolesToCreate) {
      const roleExists = await Role.findOne({ name: roleData.name });
      if (!roleExists) {
        await new Role(roleData).save();
        console.log(`👍 Rol '${roleData.name}' creado.`);
      } else {
        console.log(`ℹ️ El rol '${roleData.name}' ya existe.`);
      }
    }

    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      const adminUserExists = await User.findOne({ email: 'admin@tickethub.com' });
      if (!adminUserExists) {
        console.log("🔧 Creando usuario 'admin'...");
        const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
        await new User({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@tickethub.com',
          passwordHash: hashedPassword,
          role: adminRole._id
        }).save();
        console.log("👍 Usuario 'admin' creado con éxito.");
      } else {
        console.log("ℹ️ El usuario 'admin' ya existe.");
      }
    } else {
        console.error("🔴 Crítico: El rol 'admin' no se encontró para asignar al usuario. Abortando.");
    }

    console.log("🌱 Proceso de seeder finalizado con éxito.");

  } catch (error) {
    console.error("🔴 Error durante el proceso de seeder:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB.");
  }
};

seedDatabase();