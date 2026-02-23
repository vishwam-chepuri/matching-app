class CreateAdminUser < ActiveRecord::Migration[7.2]
  def up
    require "bcrypt"

    email    = ENV.fetch("ADMIN_EMAIL", "admin@shaadi.local")
    password = ENV.fetch("ADMIN_PASSWORD", "admin123")
    now      = Time.current

    existing = connection.select_one(
      "SELECT id FROM users WHERE email = #{connection.quote(email)} LIMIT 1"
    )

    if existing.nil?
      password_digest = BCrypt::Password.create(password)
      connection.execute(<<~SQL)
        INSERT INTO users (email, password_digest, name, is_admin, created_at, updated_at)
        VALUES (
          #{connection.quote(email)},
          #{connection.quote(password_digest)},
          'Admin',
          TRUE,
          #{connection.quote(now.iso8601)},
          #{connection.quote(now.iso8601)}
        )
      SQL
      say "Admin user created: #{email}"
    else
      connection.execute(
        "UPDATE users SET is_admin = TRUE WHERE email = #{connection.quote(email)}"
      )
      say "Admin user already exists — ensured is_admin = true"
    end
  end

  def down
    email = ENV.fetch("ADMIN_EMAIL", "admin@shaadi.local")
    connection.execute(
      "DELETE FROM users WHERE email = #{connection.quote(email)} AND is_admin = TRUE"
    )
    say "Admin user removed"
  end
end
