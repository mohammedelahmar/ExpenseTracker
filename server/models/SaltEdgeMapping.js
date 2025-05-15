import mongoose from 'mongoose';

const SaltEdgeMappingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  saltEdgeCustomerId: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const SaltEdgeMapping = mongoose.model("SaltEdgeMapping", SaltEdgeMappingSchema);
export default SaltEdgeMapping;