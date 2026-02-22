class AddContactFieldsToProfiles < ActiveRecord::Migration[7.2]
  def change
    add_column :profiles, :added_by,    :string
    add_column :profiles, :source,      :string
    add_column :profiles, :phone,       :string
    add_column :profiles, :meeting_date, :date
  end
end
