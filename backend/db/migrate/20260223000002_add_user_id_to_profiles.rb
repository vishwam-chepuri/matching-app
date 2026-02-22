class AddUserIdToProfiles < ActiveRecord::Migration[7.2]
  def change
    add_reference :profiles, :user, null: true, foreign_key: true
  end
end
