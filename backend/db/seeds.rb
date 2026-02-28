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

# Sample profile
sample_profile = admin_user.profiles.find_or_create_by!(
  first_name: "Priya",
  last_name: "Sharma"
) do |p|
  p.date_of_birth = Date.new(1997, 5, 14)
  p.height_cm = 163
  p.city = "Hyderabad"
  p.district = "Rangareddy"
  p.caste = "Brahmin"
  p.subcaste = "Smartha"
  p.edu_level = "Post Graduate"
  p.edu_field = "Computer Science"
  p.edu_institution = "IIT Hyderabad"
  p.profession_title = "Senior Software Engineer"
  p.company = "Google"
  p.company_location = "Hyderabad"
  p.package = 34.0
  p.fathers_name = "Ramesh Sharma"
  p.fathers_occupation = "Retired Bank Manager"
  p.mothers_name = "Sunita Sharma"
  p.mothers_occupation = "Homemaker"
  p.siblings = "1 elder brother, 1 younger sister"
  p.rashi = "Taurus (Vrishabha)"
  p.nakshatra = "Rohini"
  p.gotra = "Bharadwaja"
  p.status = "New"
  p.source = "Family Reference"
  p.phone = "9876543210"
  p.linkedin = "https://linkedin.com/in/priya-sharma"
  p.added_date = Date.today
end

puts "Sample profile ready: #{sample_profile.first_name} #{sample_profile.last_name}"
