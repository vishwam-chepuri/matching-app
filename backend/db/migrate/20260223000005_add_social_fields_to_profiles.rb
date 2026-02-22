class AddSocialFieldsToProfiles < ActiveRecord::Migration[7.2]
  def change
    add_column :profiles, :linkedin,  :string
    add_column :profiles, :instagram, :string
  end
end
