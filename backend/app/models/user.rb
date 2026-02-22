class User < ApplicationRecord
  has_secure_password

  has_many :profiles, dependent: :destroy

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { password.present? }

  before_save { self.email = email.downcase }
end
