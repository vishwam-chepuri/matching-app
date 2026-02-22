class AddParentNamesToProfiles < ActiveRecord::Migration[7.2]
  def change
    add_column :profiles, :fathers_name, :string
    add_column :profiles, :mothers_name, :string
  end
end
