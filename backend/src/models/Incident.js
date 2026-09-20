import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const incidentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      required: [true, 'Tracking ID is required'],
      uppercase: true,
      trim: true,
      match: [/^CASE-\d{4}-[A-Za-z0-9]{5}$/, 'trackingId must follow format CASE-YYYY-XXXXX'],
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Incident category is required'],
      enum: [
        'Phishing',
        'Financial Fraud',
        'Extortion',
        'Identity Theft',
        'Unauthorized Access',
        'Other',
      ],
    },
    platform: {
      type: String,
      default: 'Web',
      trim: true,
    },
    suspectIdentifiers: {
      type: String,
      default: '',
      trim: true,
    },
    estimatedLoss: {
      type: Number,
      default: 0,
      min: 0,
    },
    narrative: {
      type: String,
      required: [true, 'Narrative description is required'],
    },
    incidentDate: {
      type: Date,
      default: Date.now,
    },
    complainantName: {
      type: String,
      default: 'Anonymous',
      trim: true,
    },
    complainantEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['Reported', 'Under Review', 'Investigating', 'Resolved', 'Closed'],
      default: 'Reported',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [noteSchema],
    evidenceFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EvidenceFile',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
