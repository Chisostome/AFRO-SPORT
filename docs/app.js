const { createClient } = window.supabase;

const supabaseClient = createClient(
  window.AFRO_SUPABASE_URL,
  window.AFRO_SUPABASE_PUBLISHABLE_KEY
);

const form = document.getElementById("login-form");
const button = document.getElementById("login-button");
const message = document.getElementById("login-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  button.disabled = true;
  button.textContent = "Inaingia...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = "Imeshindikana kuingia. Hakikisha barua pepe na nenosiri ni sahihi.";
    button.disabled = false;
    button.textContent = "Ingia";
    return;
  }

  const { data: roleRow, error: roleError } = await supabaseClient
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const { data: profileRow, error: profileError } = await supabaseClient
    .from("profiles")
    .select("is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (roleError || profileError || !roleRow || !["super_admin", "admin"].includes(roleRow.role) || profileRow?.is_active === false) {
    await supabaseClient.auth.signOut();
    message.textContent = "Akaunti hii haina ruhusa ya Admin.";
    button.disabled = false;
    button.textContent = "Ingia";
    return;
  }

  window.location.href = "./dashboard.html";
});