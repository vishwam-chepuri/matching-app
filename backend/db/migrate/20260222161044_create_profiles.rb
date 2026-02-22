class CreateProfiles < ActiveRecord::Migration[7.2]
  def change
    create_table :profiles do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.date :date_of_birth, null: false
      t.integer :height_cm
      t.string :city
      t.string :state
      t.string :caste
      t.string :subcaste
      t.string :edu_level
      t.string :edu_field
      t.string :edu_institution
      t.string :profession_title
      t.string :company
      t.string :company_location
      t.decimal :package, precision: 10, scale: 2
      t.string :fathers_occupation
      t.string :mothers_occupation
      t.integer :siblings
      t.string :rashi
      t.string :nakshatra
      t.string :gotra
      t.string :status, default: "New"
      t.boolean :starred, default: false
      t.text :notes
      t.string :avatar_color

      t.timestamps
    end
  end
end
