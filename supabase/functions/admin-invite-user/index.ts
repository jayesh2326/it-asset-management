import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type Role = "admin" | "it_staff";

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "Method not allowed"
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = request.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, {
      error: "Missing Supabase environment variables"
    });
  }

  if (!authHeader) {
    return jsonResponse(401, {
      error: "Missing authorization header"
    });
  }

  const requesterClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user },
    error: userError
  } = await requesterClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse(401, {
      error: "Invalid user session"
    });
  }

  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return jsonResponse(403, {
      error: "Only admins can invite users"
    });
  }

  const { email, full_name, role } = (await request.json()) as {
    email?: string;
    full_name?: string;
    role?: Role;
  };

  if (!email || !full_name || !role) {
    return jsonResponse(400, {
      error: "email, full_name, and role are required"
    });
  }

  if (!["admin", "it_staff"].includes(role)) {
    return jsonResponse(400, {
      error: "Invalid role"
    });
  }

  const appUrl = Deno.env.get("APP_URL");
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name
      },
      redirectTo: appUrl || undefined
    }
  );

  if (inviteError || !inviteData.user) {
    return jsonResponse(400, {
      error: inviteError?.message ?? "Unable to invite user"
    });
  }

  const invitedUser = inviteData.user;

  const { error: upsertError } = await adminClient.from("profiles").upsert({
    id: invitedUser.id,
    email,
    full_name,
    role,
    active: true
  });

  if (upsertError) {
    return jsonResponse(400, {
      error: upsertError.message
    });
  }

  await adminClient.from("activity_logs").insert({
    entity_type: "user",
    entity_id: invitedUser.id,
    asset_id: null,
    action: "user_invited",
    message: `Invited ${email} as ${role}.`,
    metadata: {
      role
    },
    actor_id: user.id,
    actor_name: user.user_metadata.full_name ?? user.email ?? "Admin",
    actor_email: user.email ?? ""
  });

  return jsonResponse(200, {
    success: true,
    userId: invitedUser.id
  });
});
