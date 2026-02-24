class RemoveDataFromProfilePhotos < ActiveRecord::Migration[7.2]
  def up
    if ProfilePhoto.where(url: nil).exists?
      raise "Cannot remove data column: some photos have not been migrated. Run `rails photos:migrate` first."
    end

    change_column_null :profile_photos, :url, false
    remove_column :profile_photos, :data
  end

  def down
    add_column :profile_photos, :data, :text
    change_column_null :profile_photos, :url, true
  end
end
