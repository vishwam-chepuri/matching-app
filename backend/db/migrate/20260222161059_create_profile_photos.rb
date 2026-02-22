class CreateProfilePhotos < ActiveRecord::Migration[7.2]
  def change
    create_table :profile_photos do |t|
      t.references :profile, null: false, foreign_key: true
      t.text :data, null: false
      t.string :filename
      t.integer :position, default: 0

      t.timestamps
    end
  end
end
