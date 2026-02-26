class AddAddedDateAndRenameStateToDistrict < ActiveRecord::Migration[7.2]
  def change
    add_column :profiles, :added_date, :date
    rename_column :profiles, :state, :district
  end
end
