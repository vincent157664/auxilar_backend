const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SkillSchema = new Schema({
  name: {
    type: String,
  },
});

const Skill = mongoose.model('skill', SkillSchema);
export default Skill;
