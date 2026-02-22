# Create admin user
admin_user = User.find_or_create_by!(email: 'admin@shaadi.local') do |u|
  u.password = 'admin123'
  u.name = 'Admin'
  u.is_admin = true
end

# Ensure admin stays admin if already exists
admin_user.update!(is_admin: true) unless admin_user.is_admin?

# Create a seed user
seed_user = User.find_or_create_by!(email: 'demo@shaadi.local') do |u|
  u.password = 'password123'
  u.name = 'Demo User'
end

Profile.find_or_create_by!(first_name: 'Priya', last_name: 'Sharma') do |p|
  p.user = seed_user
  p.date_of_birth = Date.new(1998, 4, 12)
  p.height_cm = 163
  p.city = 'Mumbai'
  p.state = 'Maharashtra'
  p.caste = 'Brahmin'
  p.edu_level = "Master's"
  p.edu_field = 'Computer Science'
  p.edu_institution = 'IIT Bombay'
  p.profession_title = 'Software Engineer'
  p.company = 'TCS'
  p.company_location = 'Mumbai'
  p.package = 14.0
  p.rashi = 'Cancer'
  p.status = 'Shortlisted'
  p.avatar_color = '#7B1B1B'
end

Profile.find_or_create_by!(first_name: 'Ananya', last_name: 'Reddy') do |p|
  p.user = seed_user
  p.date_of_birth = Date.new(1996, 8, 25)
  p.height_cm = 158
  p.city = 'Hyderabad'
  p.state = 'Telangana'
  p.caste = 'Reddy'
  p.edu_level = 'Professional (MD/JD/CA)'
  p.edu_field = 'Medicine'
  p.edu_institution = 'AIIMS'
  p.profession_title = 'Doctor'
  p.company = 'Apollo'
  p.company_location = 'Hyderabad'
  p.package = 22.5
  p.rashi = 'Leo'
  p.status = 'Considering'
  p.avatar_color = '#2563EB'
end

Profile.find_or_create_by!(first_name: 'Meera', last_name: 'Iyer') do |p|
  p.user = seed_user
  p.date_of_birth = Date.new(1999, 1, 7)
  p.height_cm = 170
  p.city = 'Bengaluru'
  p.state = 'Karnataka'
  p.caste = 'Iyer'
  p.edu_level = "Master's"
  p.edu_field = 'Finance'
  p.edu_institution = 'IIM Ahmedabad'
  p.profession_title = 'Investment Banker'
  p.company = 'Goldman Sachs'
  p.company_location = 'Bengaluru'
  p.package = 55.0
  p.rashi = 'Virgo'
  p.status = 'New'
  p.avatar_color = '#059669'
end

puts "Seeded #{Profile.count} profiles"
