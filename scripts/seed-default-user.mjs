import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const defaultAdmin = {
  fullName: process.env.DEFAULT_ADMIN_NAME ?? "Jayesh",
  email: process.env.DEFAULT_ADMIN_EMAIL ?? "jayesh@example.com",
  password: process.env.DEFAULT_ADMIN_PASSWORD ?? "admin@123"
};

if (!supabaseUrl) {
  throw new Error("Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL before running the seed script.");
}

if (!serviceRoleKey) {
  throw new Error("Set SUPABASE_SERVICE_ROLE_KEY before running the seed script.");
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function findUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw error;
    }

    const matchedUser = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (matchedUser) {
      return matchedUser;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureDefaultAdmin() {
  const existingUser = await findUserByEmail(defaultAdmin.email);

  if (existingUser) {
    const { error } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      email: defaultAdmin.email,
      email_confirm: true,
      password: defaultAdmin.password,
      user_metadata: {
        ...existingUser.user_metadata,
        full_name: defaultAdmin.fullName
      }
    });

    if (error) {
      throw error;
    }

    return existingUser.id;
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: defaultAdmin.email,
    password: defaultAdmin.password,
    email_confirm: true,
    user_metadata: {
      full_name: defaultAdmin.fullName
    }
  });

  if (error || !data.user) {
    throw error ?? new Error("Supabase did not return the created user.");
  }

  return data.user.id;
}

async function main() {
  const userId = await ensureDefaultAdmin();

  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: userId,
    email: defaultAdmin.email,
    full_name: defaultAdmin.fullName,
    role: "admin",
    active: true
  });

  if (profileError) {
    throw profileError;
  }

  console.log("Default admin is ready:");
  console.log(`- Name: ${defaultAdmin.fullName}`);
  console.log(`- Email: ${defaultAdmin.email}`);
  console.log(`- Password: ${defaultAdmin.password}`);
}

main().catch((error) => {
  console.error("Unable to seed the default admin user.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
