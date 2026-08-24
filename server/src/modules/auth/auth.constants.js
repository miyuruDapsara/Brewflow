const ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  MANAGER: 'manager',
};

const ROLE_VALUES = Object.values(ROLES);

const BCRYPT_SALT_ROUNDS = 10;

module.exports = {
  ROLES,
  ROLE_VALUES,
  BCRYPT_SALT_ROUNDS,
};
