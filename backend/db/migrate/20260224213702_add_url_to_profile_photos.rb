class AddUrlToProfilePhotos < ActiveRecord::Migration[7.2]
  def change
    add_column :profile_photos, :url, :string
  end
end
