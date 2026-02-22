class ProfilePhoto < ApplicationRecord
  belongs_to :profile

  validates :data, presence: true
end
