// Privacy and Data Governance Types
export interface ConsentRecord {
  id: string;
  userId: string;
  templeId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
  expiresAt?: Date;
  withdrawnAt?: Date;
  source: ConsentSource;
  metadata?: Record<string, unknown>;
}

export enum ConsentType {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  FUNCTIONAL = 'functional',
  LOCATION = 'location',
  CAMERA = 'camera',
  NOTIFICATIONS = 'notifications',
  DATA_SHARING = 'data_sharing',
  PROFILING = 'profiling'
}

export enum ConsentSource {
  REGISTRATION = 'registration',
  COOKIE_BANNER = 'cookie_banner',
  SETTINGS_PAGE = 'settings_page',
  MOBILE_APP = 'mobile_app',
  ADMIN_OVERRIDE = 'admin_override',
  IMPLICIT = 'implicit',
  THIRD_PARTY = 'third_party'
}

export interface ConsentStatus {
  [ConsentType.ESSENTIAL]: boolean;
  [ConsentType.ANALYTICS]: boolean;
  [ConsentType.MARKETING]: boolean;
  [ConsentType.FUNCTIONAL]: boolean;
  [ConsentType.LOCATION]: boolean;
  [ConsentType.CAMERA]: boolean;
  [ConsentType.NOTIFICATIONS]: boolean;
  [ConsentType.DATA_SHARING]: boolean;
  [ConsentType.PROFILING]: boolean;
}

export interface DataSubject {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  dataRetentionPeriod: number; // days
  isMinor: boolean;
  guardianEmail?: string;
  consentRecords: ConsentRecord[];
  dataProcessingActivities: DataProcessingActivity[];
}

export interface DataProcessingActivity {
  id: string;
  purpose: ProcessingPurpose;
  legalBasis: LegalBasis;
  categories: DataCategory[];
  retention: RetentionPolicy;
  recipients: DataRecipient[];
  crossBorderTransfers: CrossBorderTransfer[];
  automatedDecisionMaking: boolean;
  profiling: boolean;
  riskLevel: RiskLevel;
  safeguards: string[];
}

export enum ProcessingPurpose {
  SERVICE_PROVISION = 'service_provision',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  SECURITY = 'security',
  LEGAL_COMPLIANCE = 'legal_compliance',
  LEGITIMATE_INTEREST = 'legitimate_interest',
  RESEARCH = 'research',
  PERSONALIZATION = 'personalization'
}

export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}

export enum DataCategory {
  PERSONAL_DETAILS = 'personal_details',
  CONTACT_INFO = 'contact_info',
  LOCATION_DATA = 'location_data',
  BEHAVIORAL_DATA = 'behavioral_data',
  FINANCIAL_DATA = 'financial_data',
  BIOMETRIC_DATA = 'biometric_data',
  HEALTH_DATA = 'health_data',
  RELIGIOUS_DATA = 'religious_data',
  TECHNICAL_DATA = 'technical_data',
  COMMUNICATION_DATA = 'communication_data'
}

export interface RetentionPolicy {
  purpose: string;
  period: number; // days
  criteria: RetentionCriteria;
  deletionMethod: DeletionMethod;
  exceptions: string[];
}

export enum RetentionCriteria {
  TIME_BASED = 'time_based',
  EVENT_BASED = 'event_based',
  PURPOSE_BASED = 'purpose_based',
  CONSENT_BASED = 'consent_based'
}

export enum DeletionMethod {
  HARD_DELETE = 'hard_delete',
  SOFT_DELETE = 'soft_delete',
  ANONYMIZATION = 'anonymization',
  PSEUDONYMIZATION = 'pseudonymization'
}

export interface DataRecipient {
  name: string;
  type: RecipientType;
  purpose: string;
  safeguards: string[];
  dataSharing: DataSharingAgreement;
}

export enum RecipientType {
  INTERNAL = 'internal',
  PROCESSOR = 'processor',
  THIRD_PARTY = 'third_party',
  GOVERNMENT = 'government',
  JOINT_CONTROLLER = 'joint_controller'
}

export interface DataSharingAgreement {
  agreementId: string;
  signedAt: Date;
  expiresAt?: Date;
  safeguards: string[];
  restrictions: string[];
}

export interface CrossBorderTransfer {
  country: string;
  adequacyDecision: boolean;
  safeguards: TransferSafeguard[];
  legalBasis: string;
}

export enum TransferSafeguard {
  ADEQUACY_DECISION = 'adequacy_decision',
  STANDARD_CONTRACTUAL_CLAUSES = 'standard_contractual_clauses',
  BINDING_CORPORATE_RULES = 'binding_corporate_rules',
  CERTIFICATION = 'certification',
  APPROVED_CODE_OF_CONDUCT = 'approved_code_of_conduct'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Data Subject Rights
export interface DataSubjectRequest {
  id: string;
  requestType: DataSubjectRightType;
  userId: string;
  templeId: string;
  status: RequestStatus;
  submittedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  verificationMethod: VerificationMethod;
  verifiedAt?: Date;
  requestDetails: string;
  responseData?: unknown;
  rejectionReason?: string;
  processingNotes: string[];
  assignedTo?: string;
  priority: Priority;
  deadline: Date;
}

export enum DataSubjectRightType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  RESTRICT_PROCESSING = 'restrict_processing',
  DATA_PORTABILITY = 'data_portability',
  OBJECT_PROCESSING = 'object_processing',
  WITHDRAW_CONSENT = 'withdraw_consent',
  HUMAN_REVIEW = 'human_review'
}

export enum RequestStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VERIFICATION_REQUIRED = 'verification_required',
  VERIFIED = 'verified',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum VerificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  GOVERNMENT_ID = 'government_id',
  BIOMETRIC = 'biometric',
  TWO_FACTOR = 'two_factor',
  IN_PERSON = 'in_person'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Privacy Impact Assessment
export interface PrivacyImpactAssessment {
  id: string;
  templeId: string;
  projectName: string;
  description: string;
  dataController: string;
  dataProtectionOfficer: string;
  assessmentDate: Date;
  reviewDate: Date;
  status: PIAStatus;
  riskAssessment: RiskAssessment;
  mitigationMeasures: MitigationMeasure[];
  stakeholders: Stakeholder[];
  consultation: ConsultationRecord[];
  approval: PIAApproval;
}

export enum PIAStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_REVISION = 'requires_revision'
}

export interface RiskAssessment {
  dataTypes: DataCategory[];
  processingActivities: ProcessingPurpose[];
  riskFactors: RiskFactor[];
  overallRisk: RiskLevel;
  necessityAndProportionality: AssessmentScore;
  mitigationEffectiveness: AssessmentScore;
  residualRisk: RiskLevel;
}

export interface RiskFactor {
  factor: string;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  overallRisk: RiskLevel;
}

export enum AssessmentScore {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface MitigationMeasure {
  id: string;
  title: string;
  description: string;
  category: MitigationCategory;
  priority: Priority;
  status: ImplementationStatus;
  responsible: string;
  deadline: Date;
  effectiveness: AssessmentScore;
  cost: CostCategory;
}

export enum MitigationCategory {
  TECHNICAL = 'technical',
  ORGANIZATIONAL = 'organizational',
  PROCEDURAL = 'procedural',
  LEGAL = 'legal',
  TRAINING = 'training'
}

export enum ImplementationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DEFERRED = 'deferred',
  CANCELLED = 'cancelled'
}

export enum CostCategory {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface Stakeholder {
  name: string;
  role: string;
  organization: string;
  contactInfo: string;
  involvement: StakeholderInvolvement;
}

export enum StakeholderInvolvement {
  DECISION_MAKER = 'decision_maker',
  ADVISOR = 'advisor',
  IMPLEMENTER = 'implementer',
  AFFECTED_PARTY = 'affected_party',
  REVIEWER = 'reviewer'
}

export interface ConsultationRecord {
  stakeholder: string;
  consultationDate: Date;
  method: ConsultationMethod;
  feedback: string;
  concerns: string[];
  recommendations: string[];
  followUpRequired: boolean;
}

export enum ConsultationMethod {
  MEETING = 'meeting',
  EMAIL = 'email',
  SURVEY = 'survey',
  WORKSHOP = 'workshop',
  INTERVIEW = 'interview'
}

export interface PIAApproval {
  approvedBy: string;
  approvalDate: Date;
  conditions: string[];
  reviewRequired: boolean;
  nextReviewDate?: Date;
  monitoring: MonitoringRequirement[];
}

export interface MonitoringRequirement {
  metric: string;
  frequency: MonitoringFrequency;
  threshold: string;
  responsible: string;
}

export enum MonitoringFrequency {
  CONTINUOUS = 'continuous',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

// Compliance and Audit
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  requirements: ComplianceRequirement[];
  assessmentCriteria: AssessmentCriteria[];
  applicableRegions: string[];
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  mandatory: boolean;
  controls: Control[];
  evidence: EvidenceType[];
  assessment: RequirementAssessment;
}

export enum RequirementCategory {
  LAWFULNESS = 'lawfulness',
  TRANSPARENCY = 'transparency',
  PURPOSE_LIMITATION = 'purpose_limitation',
  DATA_MINIMIZATION = 'data_minimization',
  ACCURACY = 'accuracy',
  STORAGE_LIMITATION = 'storage_limitation',
  SECURITY = 'security',
  ACCOUNTABILITY = 'accountability'
}

export interface Control {
  id: string;
  title: string;
  description: string;
  type: ControlType;
  implementation: ImplementationStatus;
  effectiveness: AssessmentScore;
  lastTested: Date;
  nextTest: Date;
  responsible: string;
}

export enum ControlType {
  PREVENTIVE = 'preventive',
  DETECTIVE = 'detective',
  CORRECTIVE = 'corrective',
  COMPENSATING = 'compensating'
}

export interface EvidenceType {
  type: string;
  description: string;
  required: boolean;
  format: EvidenceFormat[];
}

export enum EvidenceFormat {
  DOCUMENT = 'document',
  SCREENSHOT = 'screenshot',
  LOG_FILE = 'log_file',
  CERTIFICATE = 'certificate',
  ATTESTATION = 'attestation',
  DEMONSTRATION = 'demonstration'
}

export interface RequirementAssessment {
  status: ComplianceStatus;
  score: AssessmentScore;
  lastAssessed: Date;
  assessor: string;
  findings: Finding[];
  recommendations: string[];
  nextAssessment: Date;
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  NON_COMPLIANT = 'non_compliant',
  NOT_ASSESSED = 'not_assessed',
  NOT_APPLICABLE = 'not_applicable'
}

export interface Finding {
  severity: FindingSeverity;
  description: string;
  evidence: string;
  recommendation: string;
  dueDate: Date;
  status: FindingStatus;
}

export enum FindingSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export enum FindingStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ACCEPTED_RISK = 'accepted_risk',
  FALSE_POSITIVE = 'false_positive'
}

export interface AssessmentCriteria {
  criterion: string;
  weight: number;
  measurable: boolean;
  methodology: string;
  frequency: MonitoringFrequency;
}

// Privacy Notice and Policies
export interface PrivacyNotice {
  id: string;
  templeId: string;
  version: string;
  language: string;
  effectiveDate: Date;
  lastModified: Date;
  sections: PrivacySection[];
  acknowledgments: NoticeAcknowledgment[];
  status: NoticeStatus;
}

export enum NoticeStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface PrivacySection {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
  template: SectionTemplate;
  variables: Record<string, string>;
}

export enum SectionTemplate {
  DATA_COLLECTION = 'data_collection',
  USE_PURPOSES = 'use_purposes',
  LEGAL_BASIS = 'legal_basis',
  SHARING = 'sharing',
  RETENTION = 'retention',
  RIGHTS = 'rights',
  SECURITY = 'security',
  COOKIES = 'cookies',
  CONTACT = 'contact',
  UPDATES = 'updates'
}

export interface NoticeAcknowledgment {
  userId: string;
  timestamp: Date;
  version: string;
  ipAddress: string;
  userAgent: string;
  method: AcknowledgmentMethod;
}

export enum AcknowledgmentMethod {
  CHECKBOX = 'checkbox',
  BUTTON_CLICK = 'button_click',
  SCROLL_THROUGH = 'scroll_through',
  TIME_BASED = 'time_based',
  SIGNATURE = 'signature'
}

// Data Breach Management
export interface DataBreach {
  id: string;
  templeId: string;
  incidentNumber: string;
  title: string;
  description: string;
  discoveredAt: Date;
  reportedAt: Date;
  category: BreachCategory;
  severity: BreachSeverity;
  status: BreachStatus;
  affectedRecords: number;
  dataTypes: DataCategory[];
  rootCause: string;
  containmentActions: ContainmentAction[];
  notifications: BreachNotification[];
  regulatory: RegulatoryResponse;
  investigation: Investigation;
  remediation: RemediationPlan;
}

export enum BreachCategory {
  CONFIDENTIALITY = 'confidentiality',
  INTEGRITY = 'integrity',
  AVAILABILITY = 'availability',
  COMBINED = 'combined'
}

export enum BreachSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum BreachStatus {
  DISCOVERED = 'discovered',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface ContainmentAction {
  action: string;
  takenAt: Date;
  takenBy: string;
  effectiveness: AssessmentScore;
  notes: string;
}

export interface BreachNotification {
  recipient: NotificationRecipient;
  method: NotificationMethod;
  sentAt: Date;
  acknowledged: boolean;
  content: string;
  regulatory: boolean;
}

export enum NotificationRecipient {
  DATA_SUBJECTS = 'data_subjects',
  SUPERVISORY_AUTHORITY = 'supervisory_authority',
  PARTNERS = 'partners',
  MEDIA = 'media',
  INTERNAL_TEAM = 'internal_team'
}

export enum NotificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  POSTAL_MAIL = 'postal_mail',
  WEBSITE_NOTICE = 'website_notice',
  MEDIA_RELEASE = 'media_release',
  DIRECT_CONTACT = 'direct_contact'
}

export interface RegulatoryResponse {
  reportRequired: boolean;
  reportedAt?: Date;
  authority: string;
  reportReference: string;
  responseReceived: boolean;
  fineImposed: boolean;
  fineAmount?: number;
  complianceOrder: boolean;
  followUpRequired: boolean;
}

export interface Investigation {
  investigator: string;
  startedAt: Date;
  completedAt?: Date;
  methodology: string[];
  findings: InvestigationFinding[];
  conclusion: string;
  lessonsLearned: string[];
}

export interface InvestigationFinding {
  finding: string;
  evidence: string;
  impact: AssessmentScore;
  confidence: AssessmentScore;
}

export interface RemediationPlan {
  actions: RemediationAction[];
  timeline: Date;
  responsible: string;
  budget: number;
  success: SuccessCriteria[];
  monitoring: MonitoringRequirement[];
}

export interface RemediationAction {
  action: string;
  priority: Priority;
  status: ImplementationStatus;
  deadline: Date;
  responsible: string;
  cost: number;
  dependencies: string[];
}

export interface SuccessCriteria {
  criterion: string;
  measurable: boolean;
  target: string;
  achieved: boolean;
  notes: string;
}