class ChangeProfileSiblingsToString < ActiveRecord::Migration[7.2]
  def up
    # Convert existing integer data to string representation before type change.
    # Uses raw SQL to avoid ActiveRecord model/schema mismatch on fresh databases.
    execute("UPDATE profiles SET siblings = siblings::text WHERE siblings IS NOT NULL")

    change_column :profiles, :siblings, :string
  end

  def down
    change_column :profiles, :siblings, :integer, using: "siblings::integer"
  end
end
