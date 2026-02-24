class ProfilePhoto < ApplicationRecord
  belongs_to :profile

  validates :url, presence: true

  after_destroy :cleanup_file

  private

  def cleanup_file
    PhotoStorage.delete(url) if url.present?
  end
end
