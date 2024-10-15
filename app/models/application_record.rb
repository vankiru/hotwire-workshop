class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  class << self
    def random
      order("RANDOM()")
    end

    def paginate(page, per_page = 50)
      page_offset = page_offset(page, per_page)
      offset(page_offset).limit(per_page)
    end

    def page_offset(page, per_page = 50)
      page = (page || 1).to_i
      (page - 1) * per_page
    end
  end
end
