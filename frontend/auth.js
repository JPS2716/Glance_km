// Configuration
const SUPABASE_URL = "https://svclehfbtywymfnefbhg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2Y2xlaGZidHl3eW1mbmVmYmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODI5MjIsImV4cCI6MjA5MDM1ODkyMn0.9shJXtHOLIB_jeXLfe695vQQ2NfZRMBwEzevyVCYz9I";

// Use a unique variable name to avoid clashing with the CDN's global 'supabase' variable
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase initialized successfully.");
} catch (err) {
    console.error("Supabase Initialization Error:", err);
}

// Auth State Management
let currentUser = null;

async function checkSession() {
    if (!supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    updateAuthUI();
}

document.addEventListener("DOMContentLoaded", () => {
    checkSession();

    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            updateAuthUI();
        });
    }
});

function updateAuthUI() {
    const loginBtn = document.getElementById("login-btn");
    const userMenuBtn = document.getElementById("user-menu-btn");

    if (currentUser) {
        if (loginBtn) loginBtn.classList.add("hidden");
        if (userMenuBtn) {
            userMenuBtn.classList.remove("hidden");
            userMenuBtn.innerHTML = `<span style="font-family:'Material Symbols Outlined';font-size:14px;vertical-align:middle;margin-right:4px;">logout</span> Logout`;
        }
    } else {
        if (loginBtn) loginBtn.classList.remove("hidden");
        if (userMenuBtn) userMenuBtn.classList.add("hidden");
    }
}

async function handleLogin(email, password) {
    if (!supabaseClient) return false;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Login failed: " + error.message);
        return false;
    }
    return true;
}

async function handleSignup(email, password) {
    if (!supabaseClient) return false;
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        alert("Signup failed: " + error.message);
        return false;
    }
    alert("Account created! Check your email if verification is required.");
    return true;
}

async function handleLogout() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) alert("Logout failed: " + error.message);
}

async function saveActivity(filename, inferenceTime, totalDetections, outputUrl) {
    if (!currentUser || !supabaseClient) return;

    const { error } = await supabaseClient.from("activity_history").insert([{
        user_id: currentUser.id,
        filename,
        inference_time: inferenceTime,
        total_detections: totalDetections,
        output_url: outputUrl,
    }]);

    if (error) console.error("Error saving activity:", error);
    else console.log("Activity saved!");
}

window.SupabaseAuth = {
    handleLogin,
    handleSignup,
    handleLogout,
    saveActivity,
    getCurrentUser: () => currentUser,
};
