class ChangeProfileSiblingsToString < ActiveRecord::Migration[7.2]
  def up
    # Migrate existing integer data to strings before changing the column type
    Profile.where.not(siblings: nil).find_each do |profile|
      profile.update_column(:siblings, profile.siblings.to_s)
    end

    change_column :profiles, :siblings, :string
  end

  def down
    change_column :profiles, :siblings, :integer, using: "siblings::integer"
  end
end
