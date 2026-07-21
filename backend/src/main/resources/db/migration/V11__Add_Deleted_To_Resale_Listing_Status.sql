ALTER TABLE TicketExchangeListings
MODIFY COLUMN status ENUM('Active','Cancelled','Expired','Delisted','Hidden','Deleted') NOT NULL DEFAULT 'Active';
