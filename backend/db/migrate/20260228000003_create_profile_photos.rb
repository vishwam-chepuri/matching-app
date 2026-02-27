class CreateProfilePhotos < ActiveRecord::Migration[7.2]
  def change
    create_table :profile_photos do |t|
      t.references :profile, null: false, foreign_key: true
      t.string :filename
      t.integer :position, default: 0
      t.string :url, null: false

      t.timestamps
    end
  end
end
