/**
 * @typedef {Object} BlogPost
 * @property {number} id
 * @property {string} title
 * @property {string} author
 * @property {string} date
 * @property {'tech'|'lifestyle'|'business'|'sports'|'education'|'health'} category
 * @property {string} shortContent
 * @property {string} fullContent
 * @property {number} likes
 * @property {number} comments
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} BlogForm
 * @property {string} title
 * @property {string} content
 * @property {string} category
 */

/**
 * @typedef {Object} Comment
 * @property {number} id
 * @property {string} author
 * @property {string} content
 * @property {string} date
 * @property {number} postId
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {string} [first_name]
 * @property {string} [last_name]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} GenerationRequest
 * @property {string} prompt
 * @property {'text'|'image'|'video'} type
 * @property {string} [style]
 */

export {};
