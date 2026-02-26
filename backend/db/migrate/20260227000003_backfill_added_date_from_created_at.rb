class BackfillAddedDateFromCreatedAt < ActiveRecord::Migration[7.2]
  def up
    execute("UPDATE profiles SET added_date = created_at::date WHERE added_date IS NULL")
  end

  def down
    # Not reversible — can't distinguish backfilled rows from user-set ones
  end
end
