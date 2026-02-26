class Profile < ApplicationRecord
  belongs_to :user

  has_many :photos, -> { order(position: :asc) },
           class_name: 'ProfilePhoto',
           foreign_key: :profile_id,
           dependent: :destroy

  validates :first_name, :last_name, :date_of_birth, :city, presence: true

  before_create { self.added_date ||= Date.today }

  def age
    ((Date.today - date_of_birth) / 365.25).floor
  end
end
