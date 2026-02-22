# Create admin user
# In production, set ADMIN_EMAIL and ADMIN_PASSWORD env vars.
# Falls back to dev-only defaults locally.
admin_email    = ENV.fetch("ADMIN_EMAIL", "admin@shaadi.local")
admin_password = ENV.fetch("ADMIN_PASSWORD", "admin123")

admin_user = User.find_or_create_by!(email: admin_email) do |u|
  u.password = admin_password
  u.name = "Admin"
  u.is_admin = true
end

# Ensure admin stays admin if already exists
admin_user.update!(is_admin: true) unless admin_user.is_admin?

puts "Admin ready: #{admin_user.email}"
