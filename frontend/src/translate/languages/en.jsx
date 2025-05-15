const messages = {
	en: {
	  translations: {
		companySelector: {
		  selectCompany: "Access as administrator...",
		  accessingAs: "Accessing as company administrator",
		  returnToSuperAdmin: "Return to main account",
		  returnedToSuperAdmin: "Returned to super administrator account"
		},
		whitelabel: {
		  titles: {
			generalSettings: "General Settings",
			colorSettings: "Color Settings",
			logosAndBackgrounds: "Logos, Icons and Background Images"
		  },
		  labels: {
			systemName: "System name",
			copyright: "Copyright",
			privacyPolicy: "Privacy Policy Link",
			terms: "Terms of Use Link",
			chooseColor: "Choose the color to be changed"
		  },
		  colors: {
			primaryColorLight: "Primary Color Light Mode",
			secondaryColorLight: "Secondary Color Light Mode",
			primaryColorDark: "Primary Color Dark Mode",
			secondaryColorDark: "Secondary Color Dark Mode",
			iconColorLight: "Icon Color Light Mode",
			iconColorDark: "Icon Color Dark Mode",
			chatlistLight: "Internal Chat Background Light Mode",
			chatlistDark: "Internal Chat Background Dark Mode",
			boxLeftLight: "Other Messages Light Mode",
			boxLeftDark: "Other Messages Dark Mode",
			boxRightLight: "User Messages Light Mode",
			boxRightDark: "User Messages Dark Mode"
		  },
		  images: {
			appLogoLight: "Logo for light theme",
			appLogoDark: "Logo for dark theme",
			appLogoFavicon: "FavIcon Icon",
			appLogoPWAIcon: "PWA Icon",
			loginBackground: "Background image for login screen",
			signupBackground: "Background image for registration screen"
		  },
		  success: {
			settingUpdated: "Configuration updated successfully",
			backgroundUpdated: "Background image updated successfully",
			backgroundDeleted: "Background image removed successfully",
			logoUpdated: "Logo updated successfully"
		  },
		  errors: {
			settingUpdateFailed: "Error updating configuration",
			backgroundUploadFailed: "Error uploading background image",
			backgroundDeleteFailed: "Error removing background image",
			logoUploadFailed: "Error uploading logo"
		  }
		},
		company: {
		  delete: "Delete",
		  save: "Save",
		  cancel: "Cancel",
		  user: "User",
		  monthly: "Monthly",
		  bimonthly: "Bimonthly",
		  quarterly: "Quarterly",
		  semiannual: "Biannual",
		  annual: "Annual",
		  recurrence: "Recurrence",
		  enabled: "Enabled",
		  disabled: "Disabled",
		  campaigns: "Campaigns",
		  active: "Active",
		  inactive: "Inactive",
		  status: "Status",
		  plan: "Plan"
		},
		ticket: {
		  notifications: {
			notificationWarningMessageUser: "This ticket cannot be reopened because it does not have a linked connection. The ticket was closed because the connection was deleted."
		  },
		  buttons: {
			cancel: "Cancel",
			confirm: "Confirm",
			refresh: "Update the service listing"
		  },
		  emailPdf: {
			title: "Send Service by Email",
			emailLabel: "Recipient's Email",
			subjectLabel: "Subject",
			messageLabel: "Message",
			sendButton: "Send",
			cancelButton: "Cancel",
			success: "Email sent successfully!",
			error: "Error sending email. Please try again.",
			missingInfo: "Fill in all required fields."
		  },
		  pdfExport: {
			generating: "Generating PDF...",
			elementsNotFound: "Could not find the service content",
			fileTooLarge: "The generated PDF file is too large. Maximum of 10MB.",
			generationError: "Error generating PDF. Please try again."
		  },
		  menuItem: {
			sku: "Set Ticket Value and SKU",
			transfer: "Transfer Service",
			schedule: "Scheduling",
			deleteTicket: "Delete Ticket",
			createTask: "Create Task"
		  },
		  queueModal: {
			title: "Select the sector",
			queue: "Sector"
		  },
		  tagModal: {
			title: "Select the tags",
			select: "Tags",
			placeholder: "Select one or more tags"
		  },
		  glpi: {
			title: "Opening a Ticket",
			titleField: "Title",
			descriptionField: "Description",
			urgency: {
			  title: "Urgency",
			  high: "High",
			  medium: "Medium",
			  low: "Low",
			  veryHigh: "Very High",
			  veryLow: "Very Low"
			},
			buttons: {
			  cancel: "Cancel",
			  confirm: "Confirm",
			  creatingTicket: "Creating Ticket...",
			  createTicket: "Create Ticket"
			}
		  },
		  vcard: {
			buttonSave: "Save",
			buttonConversation: "Chat"
		  },
		  toasts: {
			savedContactSuccess: "Contact saved successfully."
		  },
		  sku: {
			skuValue: "Ticket Value",
			skuCode: "SKU Code",
			updatedTicketValueSuccessSku: "Value updated successfully!"
		  },
		  actionButtons: {
			exportPDF: "Export to PDF",
			close: "Close"
		  },
		  noMessagesSelected: "No message selected"
		},
		genericError: "Oops! An error occurred, refresh the page and try again, if the problem persists contact technical support.",
		signup: {
		  title: "Create Account",
		  unavailable: "Registration unavailable at the moment",
		  steps: {
			person: "Personal Information",
			company: "Company Information",
			address: "Address",
			access: "Access"
		  },
		  form: {
			personType: "Person Type",
			personTypes: {
			  physical: "Individual",
			  legal: "Legal Entity"
			},
			cpf: "CPF",
			cnpj: "CNPJ",
			fullName: "Full Name",
			razaoSocial: "Company Name",
			email: "Email",
			phone: "Phone",
			password: "Password",
			cep: "ZIP Code",
			estado: "State",
			cidade: "City",
			bairro: "Neighborhood",
			logradouro: "Street",
			numero: "Number",
			noNumber: "No number",
			plan: "Plan",
			users: "Users",
			queues: "Departments",
			loading: "Loading...",
			acceptTerms: "I have read and accept the",
			terms: "Terms of Use",
			and: "e",
			privacy: "Privacy Policy"
		  },
		  validation: {
			required: "Required field",
			emailExists: "This email is already in use",
			phoneExists: "This phone number is already in use",
			invalidDocument: "Invalid document",
			terms: "You need to accept the terms of use",
			password: {
			  requirements: "Password requirements",
			  length: "Minimum of 8 characters",
			  lowercase: "At least one lowercase letter",
			  uppercase: "At least one uppercase letter",
			  number: "At least one number",
			  special: "At least one special character (@$!%*?&)"
			}
		  },
		  passwordStrength: {
			weak: "Weak password",
			medium: "Medium password",
			strong: "Strong password"
		  },
		  buttons: {
			next: "Next",
			back: "Back",
			submit: "Sign up",
			login: "Log in",
			loginText: "Already have an account?"
		  },
		  toasts: {
			success: "Registration successful!",
			error: "Error while registering",
			errorPassword: "Error validating password",
			errorPlan: "Error selecting plan",
			errorFields: "Error validating fields",
			errorDocument: "Error validating document",
			errorAddress: "Error fetching address",
			errorEmail: "Error validating email",
			errorPhone: "Error validating phone number"
		  }
		},
		forgotPassword: {
		  title: "Forgot my password",
		  resetTitle: "Reset password",
		  email: "Email",
		  token: "Verification code",
		  newPassword: "New password",
		  confirmPassword: "Confirm new password",
		  sendEmail: "Send email",
		  resetPassword: "Reset password",
		  cancel: "Cancel",
		  invalidEmail: "Invalid email",
		  requiredEmail: "Email is required",
		  requiredToken: "Verification code is required",
		  invalidToken: "Invalid verification code",
		  requiredPassword: "New password is required",
		  minPassword: "Password must be at least 8 characters long",
		  passwordRequirements: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
		  passwordMatch: "Passwords do not match",
		  requiredConfirmPassword: "Password confirmation is required",
		  emailSent: "Email sent successfully! Check your inbox",
		  emailError: "Error sending email. Please try again",
		  resetSuccess: "Password reset successful!",
		  resetError: "Error resetting password. Please try again",
		  sendEmailTooltip: "Send email with verification code",
		  resetPasswordTooltip: "Confirm new password"
		},
		reports: {
		  title: "Service Reports",
		  description: "View and analyze data from service provided in your company.",
		  filters: {
			title: "Filters",
			startDate: "Start Date",
			endDate: "End Date",
			status: "Status",
			user: "Attendant",
			queues: "Sector",
			queue: "Sector",
			allQueue: "All Departments",
			tags: "Tags",
			search: "Search",
			period: "Period",
			filterBy: "Filter by",
			employer: "Company",
			allEmployers: "All companies",
			clearFilters: "Clear Filters",
			allStatus: "All Status",
			statusOpen: "Open",
			statusPending: "Pending",
			statusClosed: "Closed",
			allUsers: "All Attendants"
		  },
		  tabs: {
			data: "Data",
			export: "Export",
			charts: "Charts",
			exportCsv: "Export CSV"
		  },
		  table: {
			columns: {
			  id: "ID",
			  contact: "Contact",
			  queue: "Sector",
			  user: "Attendant",
			  status: "Status",
			  createdAt: "Created at",
			  updatedAt: "Updated at",
			  tags: "Tags"
			},
			noData: "No data found for the selected filters.",
			rowsPerPage: "Rows per page:",
			of: "of",
			unknown: "Unknown"
		  },
		  status: {
			open: "Open",
			pending: "Pending",
			closed: "Closed"
		  },
		  export: {
			preview: "Preview",
			previewNote: "Showing {shown} of {total} records",
			summary: "Summary",
			totalTickets: "Total Attendances",
			totalMessages: "Total Messages",
			avgMessagesPerTicket: "Average Messages per Attendance",
			avgAttendanceTime: "Average Handling Time",
			statusDistribution: "Distribution by Status",
			reportTitle: "Attendance Report",
			periodLabel: "Period",
			options: "Export Options",
			includeLogo: "Include Company Logo",
			exportPdf: "Export PDF",
			generating: "Generating...",
			success: "Report exported successfully!",
			error: "Error exporting report. Please try again.",
			logoPlaceholder: "Company logo (will be included in the PDF)"
		  },
		  exportCsv: {
			title: "Export to CSV",
			description: "Export the filtered tickets to a CSV file that can be opened in Excel or other spreadsheet programs.",
			filePreview: "CSV File Preview",
			preview: "PREVIEW",
			generating: "Generating CSV...",
			filters: "Filters",
			exportButton: "Export CSV",
			fileStructure: "Structure of the return file",
			success: "CSV generated successfully. The download will start automatically.",
			errorCsv: "Error generating CSV file. Please try again.",
			noDataToExport: "There is no data to export with the selected filters.",
			infoMessage: "The CSV file will include all tickets that match the applied filters. The data will be exported in table format with headers.",
			instructions: "Instructions for Use",
			instruction1: "The generated CSV file can be imported into programs like Microsoft Excel, Google Sheets, or LibreOffice Calc.",
			instruction2: "To open in Excel, simply double-click the downloaded file or use the 'Open' option in Excel and locate the file.",
			instruction3: "If special characters do not appear correctly, choose the UTF-8 option when opening the file."
		  },
		  charts: {
			title: "Graphical Analysis",
			daily: "Daily",
			weekly: "Weekly",
			monthly: "Monthly",
			ticketsByQueue: "Tickets by Department",
			ticketsByStatus: "Tickets by Status",
			ticketsTrend: "Ticket Trends",
			tickets: "Tickets",
			topUsers: "Top Attendants",
			topQueues: "Top Departments",
			noData: "No data available for the selected period."
		  },
		  errors: {
			loadFailed: "Failed to load data. Please try again.",
			chartLoadFailed: "Failed to load charts. Please try again.",
			summaryLoadFailed: "Failed to load summary. Please try again."
		  }
		},
		queueModal: {
		  title: {
			add: "Add department",
			edit: "Edit department",
			delete: "Delete department"
		  },
		  confirmationModal: {
			deleteTitle: "Delete",
			deleteMessage: "Are you sure? This action cannot be undone! It will be removed from the departments and related connections."
		  },
		  serviceHours: {
			sunday: "Sunday",
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday"
		  },
		  form: {
			name: "Name",
			newTicketOnTransfer: "Create a new ticket when transferring",
			color: "Color",
			keywords: "Keywords for transfer",
			greetingMessage: "Greeting message",
			complationMessage: "Conclusion message",
			outOfHoursMessage: "Off-hours message",
			ratingMessage: "Evaluation message",
			token: "Token",
			orderQueue: "Department Order (Bot)",
			integrationId: "Integration",
			closeTicket: "Close ticket",
			tags: "Tags (Kanban)"
		  },
		  buttons: {
			okAdd: "Add",
			okEdit: "Save",
			cancel: "Cancel",
			attach: "Attach File"
		  },
		  toasts: {
			deleted: "Department deleted successfully.",
			inserted: "Department created successfully.",
			tagsError: "Error fetching tags"
		  },
		  tabs: {
			queue: "Sector",
			schedules: "Timings"
		  }
		},
		queueOptions: {
		  title: "Title",
		  addChild: "Add Sub-option",
		  editing: "Editing Option",
		  add: "Add Option",
		  optionType: "Option Type",
		  message: "Message",
		  noMessage: "No message",
		  save: "Save",
		  delete: "Delete",
		  preview: {
			title: "Option Preview",
			mediaFile: "Media File",
			contactCard: "Contact Card",
			transferTo: "Transfer to",
			note: "This is a preview of how the option will be displayed to the user",
			close: "Close"
		  },
		  untitled: "No title",
		  attachFile: "Attach File",
		  selectedContact: "Contact selected",
		  selectContact: "Select Contact",
		  changeContact: "Change Contact",
		  targetQueue: "Destination Department",
		  selectQueue: "Select a department",
		  targetUser: "Destination Attendant",
		  selectUser: "Select an Attendant",
		  targetWhatsapp: "Destination Connection",
		  selectWhatsapp: "Select a Connection",
		  validationType: "Validation Type",
		  selectValidationType: "Select a Validation Type",
		  validationRegex: "Regular Expression",
		  validationRegexPlaceholder: "E.g. ^[0-9]{11}$",
		  validationRegexHelp: "Regular expression to validate user input",
		  validationErrorMessage: "Error Message",
		  validationErrorMessagePlaceholder: "Please enter a valid value",
		  conditionalLogicTitle: "Conditional Logic",
		  conditionalLogicDescription: "Set conditions to direct the user to different options",
		  conditionalVariable: "Conditional Variable",
		  selectConditionalVariable: "Select a Variable",
		  conditions: "Conditions",
		  operator: "Operator",
		  value: "Value",
		  targetOption: "Destination Option",
		  selectTargetOption: "Select an Option",
		  addCondition: "Add Condition",
		  defaultOption: "Default Option",
		  defaultOptionDescription: "Option to be selected if no condition is met",
		  noDefaultOption: "No default option",
		  optionTypes: {
			text: "Text",
			audio: "Audio",
			video: "Video",
			image: "Image",
			document: "Document",
			contact: "Contact",
			transferQueue: "Transfer to Department",
			transferUser: "Transfer to Attendant",
			transferWhatsapp: "Transfer to Connection",
			validation: "Validation",
			conditional: "Conditional"
		  },
		  validationTypes: {
			cpf: "CPF",
			email: "Email",
			phone: "Phone",
			custom: "Custom"
		  },
		  conditionalVariables: {
			lastMessage: "Last User Message"
		  },
		  operators: {
			equals: "Equal to",
			contains: "Contains",
			startsWith: "Starts with",
			endsWith: "Ends with",
			regex: "Regular Expression"
		  },
		  contactSearch: {
			title: "Search Contact",
			searchPlaceholder: "Enter name or number",
			noResults: "No contact found",
			startTyping: "Type to search for contacts",
			cancel: "Cancel"
		  }
		},
		login: {
		  title: "Login",
		  title2: "Log in",
		  forgotPassword: "Forgot my password",
		  invalidCredentials: "Incorrect email or password. Please try again.",
		  missingFields: "Please fill in all fields.",
		  rememberMe: "Remember me",
		  form: {
			email: "Email",
			password: "Password",
			emailPlaceholder: "Enter your email",
			passwordPlaceholder: "Enter your password"
		  },
		  buttons: {
			submit: "Log in",
			register: "Don't have an account? Sign up!",
			returlogin: "Back to main menu",
			send: "Send Email"
		  }
		},
		plans: {
		  form: {
			name: "Name",
			users: "Users",
			connections: "Connections",
			queue: "Departments",
			campaigns: "Campaigns",
			schedules: "Appointments",
			email: "Email",
			chat: "Internal Chat",
			isVisible: "Show",
			delete: "Do you really want to delete this record?",
			api: "External API",
			kanban: "Kanban",
			whiteLabel: "Styler",
			integrations: "Integrations",
			openAIAssistants: "AI Agents",
			flowBuilder: "Flow Builder",
			apiOfficial: "Official API",
			chatBotRules: "ChatBot Rules",
			storageLimit: "Storage Limit (MB)",
			contentLimit: "Agents Content Limit (MB)",
			enabled: "Enabled",
			disabled: "Disabled",
			clear: "Cancel",
			save: "Save",
			yes: "Yes",
			no: "No",
			money: "R$"
		  }
		},
		companies: {
		  title: "Company Management",
		  searchPlaceholder: "Search company...",
		  table: {
			id: "ID",
			status: "Status",
			name: "Name/Legal Name",
			email: "Email",
			value: "Value",
			dueDate: "Due Date",
			actions: "Actions"
		  },
		  status: {
			active: "Active",
			inactive: "Inactive"
		  },
		  buttons: {
			new: "New Company",
			view: "View",
			edit: "Edit",
			delete: "Delete",
			cancel: "Cancel",
			save: "Save",
			emailInvoice: "Send Invoice by Email",
			whatsappInvoice: "Send Invoice by WhatsApp"
		  },
		  fields: {
			personType: "Person Type",
			name: "Name",
			companyName: "Company Name",
			document: "Document",
			email: "Email",
			phone: "Phone",
			status: "Status",
			plan: "Plan",
			zipCode: "ZIP Code",
			state: "State",
			city: "City",
			neighborhood: "Neighborhood",
			street: "Street",
			number: "Number",
			currentPlan: "Current Plan",
			value: "Value",
			dueDate: "Expiration Date",
			dueDay: "Due Date",
			recurrence: "Recurrence"
		  },
		  personType: {
			individual: "Individual",
			company: "Legal Entity"
		  },
		  recurrence: {
			monthly: "Monthly",
			quarterly: "Quarterly",
			semiannual: "Biannual",
			annual: "Annual"
		  },
		  details: {
			title: "Company Details",
			tabs: {
			  main: "Main Data",
			  address: "Address",
			  billing: "Plan and Billing",
			  resources: "Features"
			}
		  },
		  resources: {
			whatsapp: "WhatsApp Connections",
			users: "Users",
			queues: "Departments"
		  },
		  edit: {
			title: "Edit Company",
			tabs: {
			  main: "Main Data",
			  address: "Address",
			  billing: "Plan and Billing"
			},
			validation: {
			  nameRequired: "Name is required",
			  nameMin: "Name must have at least 2 characters",
			  emailRequired: "Email is required",
			  emailInvalid: "Invalid email",
			  phoneRequired: "Phone number is required",
			  phoneOnlyNumbers: "Phone number must contain only numbers",
			  phoneMin: "Phone number must have at least 10 numbers",
			  phoneMax: "Phone number must have at most 11 numbers",
			  planRequired: "Plan is required",
			  dueDayFormat: "Due date must be a number",
			  dueDayRange: "Due date must be between 1 and 28",
			  zipFormat: "ZIP code must have 8 numbers",
			  stateFormat: "State must have 2 letters"
			},
			errors: {
			  loadPlans: "Error loading plans",
			  update: "Error updating company"
			},
			success: "Company updated successfully"
		  },
		  deleteDialog: {
			title: "Confirm Deletion",
			message: "Are you sure you want to delete the company {name}?"
		  },
		  toasts: {
			loadError: "Error loading companies",
			deleted: "Company successfully deleted",
			deleteError: "Error deleting company",
			invoiceSentemailSuccess: "Invoice sent successfully by email",
			invoiceSentwhatsappSuccess: "Invoice sent successfully via WhatsApp",
			invoiceSentemailError: "Error sending invoice by email",
			invoiceSentwhatsappError: "Error sending invoice via WhatsApp"
		  },
		  confirmations: {
			deleteTitle: "Delete Company",
			deleteMessage: "Are you sure you want to delete this company? This action cannot be undone."
		  },
		  notifications: {
			deleteSuccess: "Company successfully deleted",
			deleteError: "Error deleting company",
			updateSuccess: "Company updated successfully",
			updateError: "Error updating company"
		  }
		},
		auth: {
		  toasts: {
			success: "Login successful!"
		  },
		  token: "Token"
		},
		companyModal: {
		  form: {
			numberAttendants: "Number of Attendees",
			numberConections: "Number of Connections"
		  },
		  success: "Company successfully changed.",
		  add: "Company successfully added."
		},
		dashboard: {
		  tabs: {
			indicators: "Indicators",
			assessments: "NPS",
			attendants: "Attendees"
		  },
		  charts: {
			perDay: {
			  title: "Today's Attendances: "
			},
			filters: {
			  startDate: "Start Date",
			  endDate: "End Date",
			  periodText: "Period",
			  periodOptions: {
				input: "Select the desired period",
				zero: "No period selected",
				three: "Last three days",
				seven: "Last seven days",
				fifteen: "Last fifteen days",
				thirty: "Last thirty days",
				sixty: "Last sixty days",
				ninety: "Last ninety days"
			  },
			  duedate: "Expiration Date",
			  filtertype: {
				title: "Filter Type",
				valueA: "Date Filter",
				valueB: "Period Filter",
				helperText: "Select the desired period"
			  }
			}
		  },
		  cards: {
			attdPendants: "Pending Attendances",
			attdHappening: "Attendances Happening",
			attdPerformed: "Attendances Completed",
			leads: "Leads",
			mtofService: "Average Handling Time",
			mtofwaiting: "Average Waiting Time",
			inAttendance: "In Attendance",
			waiting: "Waiting",
			activeAttendants: "Active Attendees",
			finalized: "Finished",
			newContacts: "New Contacts",
			totalReceivedMessages: "Received Messages",
			totalSentMessages: "Sent Messages",
			averageServiceTime: "Average Handling Time",
			averageWaitingTime: "Average Waiting Time",
			status: "Current Status"
		  },
		  date: {
			initialDate: "Start Date",
			finalDate: "End Date"
		  },
		  users: {
			name: "Name",
			numberAppointments: "Number of Attendances",
			statusNow: "Current",
			totalCallsUser: "Total Attendances per User",
			totalAttendances: "Total Attendances"
		  },
		  licence: {
			available: "Available until"
		  },
		  assessments: {
			totalCalls: "Total Attendances",
			callsWaitRating: "Attendances awaiting evaluation",
			callsWithoutRating: "Attendances without evaluation",
			ratedCalls: "Evaluated Attendances",
			evaluationIndex: "Evaluation Index",
			score: "Score",
			prosecutors: "Promoters",
			neutral: "Neutrals",
			detractors: "Detractors"
		  },
		  stadis: {
			name: "Name",
			calif: "Evaluations",
			timemedia: "Average Handling Time",
			statuschat: "Current Status"
		  }
		},
		internalChat: {
		  deletePrompt: "This action cannot be undone, confirm?"
		},
		messageRules: {
		  title: "Message Identifiers",
		  searchPlaceholder: "Search by name, pattern or description...",
		  emptyState: {
			title: "No identifier found",
			description: "You don't have any message identifiers configured yet. Add your first identifier to automate message routing.",
			button: "Add Identifier"
		  },
		  table: {
			name: "Name",
			pattern: "Pattern",
			connection: "Connection",
			queue: "Sector",
			user: "Attendant",
			tags: "Tags",
			priority: "Priority",
			status: "Status",
			actions: "Actions"
		  },
		  tabs: {
			all: "All",
			active: "Active",
			inactive: "Inactive"
		  },
		  form: {
			name: "Identifier Name",
			pattern: "Text Pattern",
			patternHint: "Enter text that should be found in messages. Ex: 'order', 'support', 'quote'",
			isRegex: "Use regular expression",
			isRegexHint: "Enable to use regular expressions (regex) for more complex patterns",
			description: "Description",
			connection: "Connection",
			allConnections: "All connections",
			queue: "Destination sector",
			noQueue: "Select a department",
			user: "Destination attendant",
			noUser: "Select an attendant",
			priority: "Priority",
			priorityHint: "Rules with higher priority are applied first (0-100)",
			tags: "Tags to apply",
			selectTags: "Select tags",
			active: "Active",
			errors: {
			  requiredName: "Name is required",
			  requiredPattern: "Text pattern is required"
			}
		  },
		  buttons: {
			add: "Add Identifier",
			edit: "Edit",
			delete: "Delete",
			save: "Save",
			cancel: "Cancel",
			activate: "Activate",
			deactivate: "Deactivate"
		  },
		  modal: {
			addTitle: "Add Message Identifier",
			editTitle: "Edit Message Identifier"
		  },
		  confirmModal: {
			title: "Delete Identifier",
			message: "Are you sure you want to delete this message identifier? This action cannot be undone."
		  },
		  toasts: {
			created: "Identifier created successfully!",
			updated: "Identifier updated successfully!",
			deleted: "Identifier deleted successfully!",
			activated: "Identifier activated successfully!",
			deactivated: "Identifier deactivated successfully!"
		  },
		  noRecords: "No identifier found for the selected filters.",
		  active: "Active",
		  inactive: "Inactive",
		  allConnections: "All connections"
		},
		messageIdentifiers: {
		  title: "Message Identifiers",
		  description: "Set up rules for automatic message processing",
		  createRule: "Create new identifier",
		  editRule: "Edit identifier",
		  deleteRule: "Delete identifier",
		  selectConnection: "Select the connection",
		  selectTags: "Select the tags",
		  selectQueue: "Select the sector",
		  selectUser: "Select the user (optional)",
		  patternHelp: "The system will check each received message to find this pattern",
		  regexHelp: "Use regular expressions for more complex patterns",
		  priorityHelp: "Rules with higher priority will be applied first"
		},
		messageHistoryModal: {
		  close: "Close",
		  title: "Message editing history"
		},
		uploads: {
		  titles: {
			titleUploadMsgDragDrop: "DRAG AND DROP FILES IN THE FIELD BELOW",
			titleFileList: "List of file(s)"
		  }
		},
		whatsappModal: {
		  title: {
			add: "New Connection",
			edit: "Edit Connection",
			editOfficial: "Edit Official WhatsApp Connection",
			addOfficial: "Add Official WhatsApp Connection"
		  },
		  form: {
			name: "Name",
			default: "Pattern",
			group: "Allow Groups",
			autoImport: "Import Contacts",
			autoReject: "Decline Calls",
			availableQueues: "Departments",
			uploadMedia: "Media Upload",
			clearMedia: "Clear Media",
			token: "Access Token",
			fileSize: "Maximum file size: 5MB",
			showQrCodeAfterSave: "Display QR Code after saving connection",
			importOldMessagesEnable: "Import old messages",
			importOldMessagesGroups: "Import group messages",
			closedTicketsPostImported: "Close tickets after import",
			importOldMessages: "Start date for import",
			importRecentMessages: "End date for import",
			importAlert: "Importing may take time depending on the message quantity. Please wait.",
			queueRedirection: "Sector Redirection",
			queueRedirectionDesc: "Select which sector tickets will be redirected to and after how long",
			sendIdQueue: "Redirection Sector",
			timeSendQueue: "Redirection Time (minutes)",
			integrationId: "Integration ID",
			prompt: "AI Prompt",
			disabled: "Disabled",
			greetingMessage: "Greeting Message",
			complationMessage: "Conclusion Message",
			outOfHoursMessage: "Off-hours Message",
			ratingMessage: "Evaluation Message",
			collectiveVacationMessage: "Collective Vacation Message",
			collectiveVacationStart: "Start of Collective Vacation",
			collectiveVacationEnd: "End of Collective Vacation",
			timeCreateNewTicket: "Time to Create New Ticket (minutes)",
			maxUseBotQueues: "Chatbot Usage Limit",
			timeUseBotQueues: "Chatbot Usage Interval (minutes)",
			expiresTicket: "Close Tickets After (hours)",
			whenExpiresTicket: "When to Close",
			closeLastMessageOptions1: "Last customer message",
			closeLastMessageOptions2: "Last agent message",
			expiresInactiveMessage: "Inactivity Message",
			timeInactiveMessage: "Time for Inactivity Message (minutes)",
			inactiveMessage: "Inactive Message",
			color: "Badge Color",
			connectionInfo: "Connection Information",
			metaApiConfig: "Meta API Configuration",
			officialWppBusinessId: "WhatsApp Business ID",
			officialPhoneNumberId: "Phone Number ID",
			officialAccessToken: "Access Token",
			queuesAndIntegrations: "Queues and Integrations",
			messages: "Messages",
			settings: "Settings"
		  },
		  buttons: {
			okAdd: "Save",
			okEdit: "Save",
			cancel: "Cancel",
			refresh: "Update Token",
			copy: "Copy Token",
			upload: "Add Image",
			help: "Help"
		  },
		  tabs: {
			general: "General",
			integrations: "Integrations",
			messages: "Messages",
			chatbot: "Chatbot",
			assessments: "Evaluations",
			schedules: "Timings"
		  },
		  help: {
			title: "Help - WhatsApp",
			description: "WhatsApp Connection Configuration",
			required: "Required Fields",
			name: "Name: Unique connection identification",
			queue: "Sector: Default sector for ticket routing"
		  },
		  validation: {
			nameRequired: "Name is required",
			nameMin: "Name must have at least 2 characters",
			nameMax: "Name must have a maximum of 50 characters",
			collectiveVacationStartRequired: "Start date of vacation is mandatory",
			collectiveVacationEndRequired: "End date of vacation is mandatory",
			collectiveVacationEndAfterStart: "End date must be after the start date",
			timeCreateNewTicketMin: "Time must be greater than or equal to 0",
			maxUseBotQueuesMin: "Limit must be greater than or equal to 0",
			expiresTicketMin: "Time must be greater than or equal to 0",
			tokenRequired: "Access token is mandatory",
			businessIdRequired: "WhatsApp Business ID is mandatory",
			phoneNumberIdRequired: "Phone Number ID is mandatory"
		  },
		  success: {
			saved: "WhatsApp saved successfully!",
			update: "WhatsApp updated successfully!"
		  },
		  tokenRefreshed: "Token updated successfully!",
		  tokenCopied: "Token copied to clipboard!",
		  scheduleSaved: "Schedules saved successfully!",
		  errors: {
			fetchData: "Error loading data",
			fetchWhatsApp: "Error loading WhatsApp data",
			saveWhatsApp: "Error saving WhatsApp",
			fileSize: "File too large. Maximum allowed: 5MB",
			requiredFields: "Fill in all required fields"
		  }
		},
		profile: {
		  title: "Profile",
		  roles: {
			admin: "Administrator",
			user: "User",
			superv: "Supervisor"
		  },
		  buttons: {
			edit: "Edit Profile"
		  },
		  stats: {
			openTickets: "Open Tickets",
			closedToday: "Closed Today",
			averageResponseTime: "Average Response Time",
			rating: "Rating"
		  },
		  fields: {
			name: "Name",
			email: "Email",
			workHours: "Working Hours"
		  }
		},
		queueIntegrationModal: {
		  title: {
			add: "Add project",
			edit: "Edit project"
		  },
		  form: {
			id: "ID",
			type: "Type",
			name: "Name",
			projectName: "Project Name",
			language: "Language",
			jsonContent: "JsonContent",
			urlN8N: "URL",
			n8nApiKey: "n8n API Key",
			OpenApiKey: "OpenAI API Key",
			typebotSlug: "Typebot - Slug",
			selectFlow: "Flow Name",
			typebotExpires: "Time in minutes to expire a conversation",
			typebotKeywordFinish: "Word to close the ticket",
			typebotKeywordRestart: "Word to restart the flow",
			typebotRestartMessage: "Message when restarting the conversation",
			typebotUnknownMessage: "Invalid option message",
			typebotDelayMessage: "Interval (ms) between messages"
		  },
		  buttons: {
			okAdd: "Save",
			okEdit: "Save",
			cancel: "Cancel",
			test: "Test Bot"
		  },
		  messages: {
			testSuccess: "Integration successfully tested!",
			addSuccess: "Integration added successfully.",
			editSuccess: "Integration edited successfully."
		  }
		},
		promptModal: {
		  form: {
			name: "Name",
			prompt: "Prompt",
			voice: "Voice",
			max_tokens: "Maximum Tokens in the response",
			temperature: "Temperature",
			apikey: "API Key",
			max_messages: "Maximum messages in History",
			voiceKey: "Voice API Key",
			voiceRegion: "Voice Region"
		  },
		  success: "Prompt saved successfully!",
		  title: {
			add: "Add Prompt",
			edit: "Edit Prompt"
		  },
		  buttons: {
			okAdd: "Save",
			okEdit: "Save",
			cancel: "Cancel"
		  }
		},
		prompts: {
		  title: "Prompts",
		  noDataFound: "Oops, nothing here!",
		  noDataFoundMessage: "No prompt found. Don't worry, you can create the first one! Click the button below to start.",
		  table: {
			name: "Name",
			queue: "Sector",
			max_tokens: "Maximum Response Tokens",
			actions: "Actions"
		  },
		  confirmationModal: {
			deleteTitle: "Delete",
			deleteMessage: "Are you sure? This action cannot be undone!"
		  },
		  buttons: {
			add: "Create Prompt"
		  }
		},
		contactsImport: {
		  notifications: {
			started: "Import started! You will be notified about the progress.",
			error: "Error starting import. Please try again.",
			noFile: "Select a CSV file to import",
			progress: "Import in progress: {percentage}% completed",
			complete: "Import completed! {validCount} contacts imported successfully. {invalidCount} invalid contacts.",
			importError: "Import error: {message}"
		  },
		  instructions: {
			title: "To import contacts, you need to follow the guidelines below:",
			csvFormat: "The file to be imported must be in .CSV format.",
			numberFormat: "WhatsApp numbers must be entered without spaces and separated by semicolons (;).",
			exampleTitle: "Example of how the spreadsheet should be filled out."
		  }
		},
		contacts: {
		  title: "Contacts Management",
		  subtitle: "of",
		  searchPlaceholder: "Search contacts...",
		  emptyMessage: "No contact found",
		  noContactsFound: "No contact found",
		  noContactsFoundMessage: "No contacts registered yet.",
		  addContactMessage: "Add a new contact to get started!",
		  import: {
			title: "Import Contacts",
			steps: {
			  selectFile: "Select File",
			  mapFields: "Map Fields",
			  review: "Review",
			  result: "Result"
			},
			mapFields: "Field Mapping",
			selectFilePrompt: "Select a CSV or Excel file to import contacts",
			dragAndDrop: "Drag and drop your file here",
			or: "or",
			browse: "Browse",
			supportedFormats: "Supported formats: CSV, XLS, XLSX",
			needTemplate: "Need a template?",
			downloadTemplate: "Download template",
			processingFile: "Processing file...",
			mapFieldsInfo: "Select which columns in your file correspond to each contact field. Fields marked with * are mandatory.",
			fullContact: "Import full data (include additional fields)",
			selectField: "Select a field",
			extraFields: "Additional fields",
			extraFieldsInfo: "Map additional fields to be imported as extra contact information.",
			noExtraFields: "No additional fields mapped.",
			addExtraField: "Add extra field",
			extraFieldName: "Name of the extra field",
			value: "Value",
			validationErrors: "{{count}} validation errors were found",
			errorDetails: "{{count}} records with issues",
			rowError: "Row {{row}}: {{error}}",
			moreErrors: "...and {{count}} more errors",
			validation: {
			  nameRequired: "The Name field is required",
			  numberRequired: "The Number field is required",
			  emptyName: "Blank Name",
			  emptyNumber: "Blank Number",
			  invalidNumberFormat: "Invalid number format",
			  invalidEmail: "Invalid email",
			  companyNotFound: "Company \"{{company}}\" not found, will be created automatically",
			  positionNotFound: "Position \"{{position}}\" not found, will be created automatically",
			  dataErrors: "{{count}} records contain errors"
			},
			reviewAndImport: "Review and import",
			reviewInfo: "Check if the data is correct before starting the import.",
			summary: "Summary",
			totalRecords: "Total records",
			validRecords: "Valid records",
			invalidRecords: "Records with warnings",
			importMode: "Import mode",
			fullContactMode: "Full registration",
			basicContactMode: "Basic registration",
			mappedFields: "Mapped fields",
			notMapped: "Not mapped",
			extraField: "Extra field",
			previewData: "Data preview",
			showingFirst: "Showing the first {{count}} of {{total}} records",
			importingContacts: "Importing contacts...",
			pleaseWait: "Please wait. This may take a few minutes.",
			importComplete: "Import completed",
			importFailed: "Import failed",
			totalProcessed: "Total processed",
			successful: "Success",
			failed: "Failures",
			errors: {
			  invalidFileType: "Invalid file type",
			  emptyFile: "Empty file",
			  parsingFailed: "Failed to process file",
			  readFailed: "Failed to read file",
			  processingFailed: "Failed to process file",
			  fetchEmployersFailed: "Error fetching employers",
			  fetchPositionsFailed: "Error fetching positions",
			  validationFailed: "Validation failed. Correct the errors before continuing.",
			  importFailed: "Import failed",
			  generalError: "General import error",
			  timeout: "Import time exceeded",
			  statusCheckFailed: "Failed to check import status",
			  templateGenerationFailed: "Failed to generate template"
			},
			successMessage: "{{count}} contacts were imported successfully.",
			failureMessage: "No contacts were imported. Check the errors and try again.",
			importAnother: "Import more contacts",
			import: "Import"
		  },
		  table: {
			id: "ID",
			name: "Name",
			number: "Number",
			email: "Email",
			company: "Company",
			tags: "Tags",
			bot: "Bot",
			actions: "Actions",
			whatsapp: "WhatsApp",
			groupId: "Group ID",
			botEnabled: "Bot Activated",
			botDisabled: "Bot Deactivated",
			disableBot: "Bot Status",
			noTags: "No tags"
		  },
		  buttons: {
			add: "Add Contact",
			addContact: "Add Contact",
			edit: "Edit Contact",
			delete: "Delete Contact",
			deleteAll: "Delete All",
			addOrDelete: "Manage",
			import: "Import",
			export: "Export",
			importExport: "Import/Export",
			startChat: "Start Conversation",
			block: "Block contact",
			unblock: "Unblock contact",
			manage: "Options"
		  },
		  bulkActions: {
			selectedContacts: "{{count}} contacts selected",
			actions: "Bulk Actions",
			enableBot: "Activate Bot",
			disableBot: "Deactivate Bot",
			block: "Block",
			unblock: "Unblock",
			delete: "Delete"
		  },
		  confirmationModal: {
			deleteTitleNoHasContactCreated: "No contacts registered",
			deleteTitleNoHasContactCreatedMessage: "You don't have any contacts registered yet. Click on 'Add' to create a new contact.",
			deleteTitle: "Delete contact",
			deleteMessage: "This action is irreversible. Are you sure you want to delete this contact?",
			deleteAllTitle: "Delete all contacts",
			deleteAllMessage: "This action is irreversible. Are you sure you want to delete all contacts?",
			blockTitle: "Block contact",
			blockMessage: "By blocking this contact, you will no longer be able to send or receive messages from them.",
			unblockTitle: "Unblock contact",
			unblockMessage: "By unblocking this contact, you will start receiving messages from them again.",
			bulkEnableBotTitle: "Activate Bot for selected contacts",
			bulkEnableBotMessage: "Are you sure you want to activate the bot for all selected contacts?",
			bulkDisableBotTitle: "Deactivate Bot for selected contacts",
			bulkDisableBotMessage: "Are you sure you want to deactivate the bot for all selected contacts?",
			bulkBlockTitle: "Block selected contacts",
			bulkBlockMessage: "Are you sure you want to block all selected contacts? You will no longer be able to send or receive messages from them.",
			bulkUnblockTitle: "Unblock selected contacts",
			bulkUnblockMessage: "Are you sure you want to unblock all selected contacts? You will start receiving messages from them again.",
			bulkDeleteTitle: "Delete selected contacts",
			bulkDeleteMessage: "This action is irreversible. Are you sure you want to delete all selected contacts?",
			genericTitle: "Confirm action",
			genericMessage: "Are you sure you want to perform this action?"
		  },
		  toasts: {
			deleted: "Contact deleted successfully!",
			deletedAll: "All contacts were deleted successfully!",
			blocked: "Contact blocked successfully!",
			unblocked: "Contact unblocked successfully!",
			bulkBotEnabled: "Bot activated for selected contacts!",
			bulkBotDisabled: "Bot deactivated for selected contacts!",
			bulkBlocked: "Selected contacts were blocked!",
			bulkUnblocked: "Selected contacts were unblocked!",
			bulkDeleted: "Selected contacts were deleted!",
			noContactsSelected: "No contact selected",
			unknownAction: "Unknown action",
			bulkActionError: "Error executing bulk action"
		  },
		  form: {
			name: "Name",
			number: "Number",
			email: "E-Mail",
			company: "Company",
			position: "Position"
		  },
		  filters: {
			byTag: "Filter by tag",
			selectTags: "Select the tags to filter by",
			noTagsAvailable: "No tag available"
		  }
		},
		contactModal: {
		  title: {
			new: "New Contact",
			edit: "Edit Contact"
		  },
		  helpText: "Fill in the contact information. Phone number must be in the format: DDI DDD NUMBER (Ex: 55 16 996509803)",
		  sections: {
			basic: "Basic Information",
			tags: "Tags",
			organization: "Organizational Information",
			additional: "Additional Information"
		  },
		  form: {
			name: "Name",
			number: "Number",
			email: "Email",
			numberFormat: "Format: DDI DDD NUMBER (Ex: 55 16 996509803)",
			numberTooltip: "Use the format: DDI DDD NUMBER (Ex: 55 16 996509803)",
			company: "Company",
			position: "Position",
			selectCompanyFirst: "Select a company first",
			positionHelp: "Type to create a new position or select an existing one",
			disableBot: "Deactivate Bot",
			extraName: "Field Name",
			extraValue: "Field Value",
			noExtraInfo: "No additional information. Click the button below to add."
		  },
		  buttons: {
			cancel: "Cancel",
			save: "Save",
			update: "Update",
			remove: "Remove",
			addExtraInfo: "Add Field",
			okEdit: "Edit",
			okAdd: "Add"
		  },
		  tags: {
			saveFirst: "Tags can be added after saving the contact."
		  },
		  success: {
			created: "Contact created successfully!",
			updated: "Contact updated successfully!",
			profilePic: "Profile picture updated successfully!"
		  },
		  warnings: {
			tagsSyncFailed: "Contact saved, but there was an error adding the tags"
		  },
		  errors: {
			loadData: "Error loading necessary data",
			loadCompanies: "Error loading companies",
			saveGeneric: "Error saving contact. Check the data and try again."
		  }
		},
		contactTagsManager: {
		  selectTags: "Select the tags",
		  noTags: "No tag assigned to this contact",
		  success: {
			updated: "Tags updated successfully!"
		  },
		  errors: {
			loadTags: "Error loading tags",
			loadContactTags: "Error loading contact tags",
			updateTags: "Error updating tags"
		  }
		},
		newPositionModal: {
		  title: "New Position",
		  form: {
			name: "Name"
		  },
		  buttons: {
			cancel: "Cancel",
			save: "Save"
		  },
		  validation: {
			required: "The Name field is required."
		  },
		  success: "Position created successfully!",
		  error: "Error creating position. Please try again later."
		},
		employerModal: {
		  title: "New Company",
		  success: "Company registered successfully",
		  form: {
			name: "Company Name"
		  }
		},
		userModal: {
		  title: {
			add: "Add User",
			edit: "Edit User"
		  },
		  tabs: {
			info: "Information",
			permission: "Permissions",
			notifications: "Notifications"
		  },
		  form: {
			name: "Name",
			email: "Email",
			password: "Password",
			profileT: "Profile",
			profile: {
			  admin: "Administrator",
			  user: "User",
			  superv: "Supervisor"
			},
			profileHelp: "Sets the user's access level in the system",
			ramal: "Extension",
			startWork: "Start of Shift",
			endWork: "End of Shift",
			workHoursHelp: "Sets the user's work schedule",
			super: "Super User",
			superHelp: "Allows full access to the system",
			allTicket: "View All Tickets",
			allTicketHelp: "Allows viewing all tickets, including those without a department",
			spy: "Spy on Conversations",
			spyHelp: "Allows spying on ongoing conversations",
			isTricked: "View Contact List",
			isTrickedHelp: "Permite visualizar a lista de contatos",
			defaultMenu: "Default Menu",
			defaultMenuHelp: "Sets the initial state of the side menu",
			defaultMenuOpen: "Open",
			defaultMenuClosed: "Closed",
			color: "User Color",
			colorHelp: "User identification color in the system",
			whatsapp: "Default Connection",
			whatsappHelp: "Default connection that the user will attend to",
			whatsappNone: "None",
			number: "WhatsApp Number",
			numberHelp: "Number that will receive notifications (with area code)",
			notificationSettings: "WhatsApp Notification Settings",
			notificationTypes: "Notification Types",
			notifyNewTicket: "New Attendance Notification",
			notifyNewTicketHelp: "Sends notification on WhatsApp when there is a new attendance in this user's queues",
			notifyTask: "Tasks Notification",
			notifyTaskHelp: "Sends notification on WhatsApp about new tasks or overdue tasks assigned to this user",
			onlyAdminSupervHelp: "Only administrators and supervisors can edit notification settings.",
			glpiUser: "GLPI User",
			glpiPass: "GLPI Password",
			glpiHelp: "Credentials for integration with GLPI",
			profilePicHelp: "Click on the image to change",
			canRestartConnections: "Restart Connections",
			canRestartConnectionsHelp: "Allows the user to restart WhatsApp connections"
		  },
		  buttons: {
			cancel: "Cancel",
			okAdd: "Add",
			okEdit: "Save"
		  },
		  success: "User saved successfully!",
		  errors: {
			load: "Error loading user",
			save: "Error saving user"
		  }
		},
		scheduleModal: {
		  title: {
			add: "New Schedule",
			edit: "Edit Schedule"
		  },
		  form: {
			body: "Message",
			contact: "Contact",
			sendAt: "Schedule Date",
			sentAt: "Sending Date"
		  },
		  buttons: {
			okAdd: "Add",
			okEdit: "Save",
			cancel: "Cancel"
		  },
		  success: "Schedule saved successfully."
		},
		chat: {
		  title: "Internal Chat",
		  conversations: "Conversations",
		  chatList: "Conversations List",
		  messages: "Messages",
		  recentMessages: "Recent Messages",
		  selectChat: "Select a conversation",
		  selectChatMessage: "Choose a conversation to start interacting",
		  newChat: "New Conversation",
		  editChat: "Edit Conversation",
		  deleteChat: "Delete Conversation",
		  delete: "Delete Conversation",
		  createGroup: "Create Group",
		  leaveGroup: "Leave Group",
		  chatTitle: "Conversation Title",
		  selectUsers: "Select Participants",
		  searchUsers: "Search users...",
		  selectedUsers: "Selected Participants",
		  create: "Create",
		  saveChanges: "Save Changes",
		  cancel: "Cancel",
		  titleRequired: "Title is required",
		  titleMinLength: "Title must be at least 3 characters",
		  titleMaxLength: "Title must have a maximum of 50 characters",
		  usersRequired: "Select at least one participant",
		  sendMessage: "Send message",
		  typeMessage: "Type your message...",
		  messagePlaceholder: "Write a message",
		  noMessages: "No messages yet",
		  loadingMessages: "Loading messages...",
		  loadMore: "Load more",
		  messageDeleted: "Message deleted",
		  attachFile: "Attach file",
		  uploadImage: "Send image",
		  uploadVideo: "Send video",
		  recordAudio: "Record audio",
		  stopRecording: "Stop recording",
		  preview: "Preview",
		  send: "Send",
		  downloading: "Downloading...",
		  uploading: "Sending...",
		  copyMessage: "Copy message",
		  deleteMessage: "Delete message",
		  editMessage: "Edit message",
		  quoteMessage: "Reply",
		  typing: "typing...",
		  online: "Online",
		  offline: "Offline",
		  lastSeen: "Last seen",
		  recording: "Recording...",
		  deleteConfirmTitle: "Delete Conversation",
		  deleteConfirmMessage: "Are you sure you want to delete this conversation? This action cannot be undone.",
		  leaveConfirmTitle: "Leave Group",
		  leaveConfirmMessage: "Are you sure you want to leave this group?",
		  blockUser: "Block user",
		  unblockUser: "Unblock user",
		  reportUser: "Report user",
		  blockUserConfirm: "Confirm block",
		  blockUserMessage: "Are you sure you want to block this user?",
		  reportUserTitle: "Report User",
		  reportPlaceholder: "Describe the reason for the report",
		  userBlocked: "User blocked",
		  userUnblocked: "User unblocked",
		  reportSent: "Report sent",
		  exportChat: "Export conversation",
		  exportPdf: "Export as PDF",
		  exportSuccess: "Conversation exported successfully",
		  viewMode: "View mode",
		  listView: "List view",
		  gridView: "Grid view",
		  tooltips: {
			sendButton: "Send message",
			attachButton: "Attach file",
			recordButton: "Record audio",
			emojiButton: "Insert emoji",
			blockButton: "Block user",
			reportButton: "Report user",
			exportButton: "Export conversation",
			editButton: "Edit conversation",
			deleteButton: "Delete conversation",
			searchButton: "Search in messages",
			viewModeButton: "Toggle view mode"
		  },
		  errors: {
			loadError: "Error loading conversations",
			loadMessagesError: "Error loading messages",
			sendError: "Error sending message",
			uploadError: "Error sending file",
			recordingError: "Error recording audio",
			deleteError: "Error deleting conversation",
			createError: "Error creating conversation",
			editError: "Error editing conversation",
			blockError: "Error blocking user",
			reportError: "Error sending report",
			exportError: "Error exporting conversation",
			loadUsersError: "Error loading users",
			searchError: "Error searching for users",
			saveError: "Error saving conversation"
		  },
		  success: {
			messageSent: "Message sent",
			conversationCreated: "Conversation created successfully",
			conversationUpdated: "Conversation updated successfully",
			conversationDeleted: "Conversation deleted successfully",
			userBlocked: "User blocked successfully",
			userUnblocked: "User unblocked successfully",
			reportSent: "Report sent successfully",
			chatExported: "Conversation exported successfully",
			createSuccess: "Conversation created successfully",
			editSuccess: "Conversation updated successfully"
		  },
		  empty: {
			noChats: "No conversation found",
			noMessages: "No message found",
			noResults: "No results found",
			startConversation: "Start a new conversation!",
			noConversations: "You don't have any conversations yet"
		  },
		  search: {
			searchChats: "Search conversations",
			searchMessages: "Search messages",
			searchUsers: "Search users",
			noResults: "No results found",
			searching: "Searching..."
		  }
		},
		ticketsManager: {
		  buttons: {
			newTicket: "New",
			newGroup: "New Group"
		  }
		},
		ticketsQueueSelect: {
		  placeholder: "Departments"
		},
		tickets: {
		  inbox: {
			closeAll: "Close all tickets",
			confirmCloseTitle: "Close tickets",
			confirmCloseConnectionMessage: "Do you want to close all tickets from connection {{connection}}?",
			confirmCloseAllMessage: "Do you want to close all tickets from all connections?",
			confirm: "Confirm",
			cancel: "Cancel",
			yes: "YES",
			no: "NO",
			closedAllTickets: "Do you want to close all tickets?",
			newTicket: "New Ticket",
			open: "Open",
			resolverd: "Resolved",
			ticketDeleteSuccessfully: "Ticket deleted successfully."
		  },
		  toasts: {
			deleted: "The service you were in has been deleted."
		  },
		  notification: {
			message: "Message from"
		  },
		  tabs: {
			open: {
			  title: "Open"
			},
			group: {
			  title: "Groups"
			},
			private: {
			  title: "Private"
			},
			closed: {
			  title: "Resolved"
			},
			search: {
			  title: "Search"
			}
		  },
		  search: {
			filterConnections: "Connection",
			ticketsPerPage: "Tickets per page",
			placeholder: "Search for service and messages",
			filterConectionsOptions: {
			  open: "Open",
			  closed: "Closed",
			  pending: "Pending",
			  group: "Groups"
			}
		  },
		  connections: {
			allConnections: "All connections"
		  },
		  buttons: {
			showAll: "All",
			refresh: "Update"
		  }
		},
		statistics: {
		  title: "Statistics",
		  startDate: "Start Date",
		  endDate: "End Date",
		  stateFilter: "Filter by State",
		  dddFilter: "Filter by Area Code",
		  allStates: "All States",
		  selectDDDs: "Select Area Codes",
		  buttons: {
			generate: "Generate Report"
		  },
		  fetchSuccess: "Statistics loaded successfully",
		  fetchError: "Error loading statistics",
		  cards: {
			totalAttendances: "Total Attendances",
			openTickets: "Open Tickets",
			averageResponseTime: "Average Response Time",
			newContacts: "New Contacts",
			stateContacts: "Contacts in State",
			stateContactsBreakdown: "{{dddCount}} of {{stateTotal}} contacts in {{state}}"
		  },
		  charts: {
			ticketsEvolution: "Ticket Evolution",
			ticketsChannels: "Ticket Channels",
			brazilMap: "Contacts Map by State"
		  }
		},
		transferTicketModal: {
		  title: "Transfer Ticket",
		  fieldLabel: "Type to search for users",
		  comments: "Comments",
		  fieldQueueLabel: "Transfer to a department",
		  fieldQueuePlaceholder: "Select a department",
		  noOptions: "No user found with that name",
		  fieldConnectionSelect: "Select a connection",
		  buttons: {
			ok: "Transfer",
			cancel: "Cancel"
		  }
		},
		ticketsList: {
		  pendingHeader: "Waiting",
		  assignedHeader: "Assisting",
		  noTicketsTitle: "Nothing here!",
		  noTicketsMessage: "No assistance found with that status or searched term",
		  tagModalTitle: "Ticket Tags",
		  noTagsAvailable: "No tag available",
		  buttons: {
			exportAsPdf: "Export as PDF",
			accept: "Accept",
			closed: "Finish",
			reopen: "Reopen",
			close: "Close"
		  }
		},
		newTicketModal: {
		  statusConnected: "CONNECTED",
		  statusDeconnected: "DISCONNECTED",
		  connectionDefault: "Pattern",
		  title: "Create Ticket",
		  fieldLabel: "Type to search for contact",
		  add: "Add",
		  buttons: {
			ok: "Save",
			cancel: "Cancel"
		  },
		  queue: "Select a department",
		  conn: "Select a connection"
		},
		ticketdetails: {
		  iconspy: "Spy Conversation",
		  iconacept: "Accept Conversation",
		  iconreturn: "Return to department",
		  iconstatus: "NO DEPARTMENT"
		},
		SendContactModal: {
		  title: "Send contact(s)",
		  fieldLabel: "Type to search",
		  selectedContacts: "Selected contacts",
		  add: "Create new contact",
		  buttons: {
			newContact: "Create new contact",
			cancel: "cancel",
			ok: "send"
		  }
		},
		daysweek: {
		  day1: "Monday",
		  day2: "Tuesday",
		  day3: "Wednesday",
		  day4: "Thursday",
		  day5: "Friday",
		  day6: "Saturday",
		  day7: "Sunday",
		  save: "Save"
		},
		mainDrawer: {
		  listTitle: {
			service: "Tickets",
			management: "Management",
			administration: "Administration"
		  },
		  listItems: {
			dashboard: "Dashboard",
			api: "API",
			adminDashboard: "Admin Dashboard",
			zabbix: "Zabbix Dashboard",
			statistics: "Statistics",
			connections: "Connections",
			groups: "Groups",
			flowBuilder: "Conversation Flows",
			messageRules: "ChatBot Rules",
			reports: "Reports",
			tickets: "Conversations",
			chatsTempoReal: "Live Chat",
			tasks: "Tasks",
			quickMessages: "Quick Replies",
			asaasServices: "Asaas Services",
			contacts: {
			  menu: "Contacts",
			  list: "Contacts Agenda",
			  employers: "Companies",
			  employerspwd: "Password Bank",
			  positions: "Positions"
			},
			queues: "Departments & Chatbot",
			tags: "Tags",
			kanban: "Kanban",
			email: "Email",
			users: "Collaborators",
			whatsappTemplates: "Whatsapp Templates",
			settings: "Settings",
			helps: "Help Center",
			messagesAPI: "API",
			internalAPI: "Internal API",
			schedules: "Appointments",
			campaigns: "Campaigns",
			annoucements: "Informative",
			chats: "Internal Chat",
			financeiro: "Financial",
			files: "File List",
			integrations: {
			  menu: "Automations"
			},
			prompts: "OpenAI Prompts",
			profiles: "Access Profiles",
			permissions: "Permissions",
			assistants: "OpenAI Agents",
			queueIntegration: "Integrations",
			typebot: "Typebot",
			companies: "Companies",
			version: "Version",
			exit: "Exit"
		  },
		  appBar: {
			notRegister: "No active connection.",
			greetings: {
			  hello: "Hello, ",
			  tasks: "you have {{count}} open tasks!",
			  one: "Hello ",
			  two: "Welcome to ",
			  three: "Active until"
			},
			menu: "Menu",
			tasks: "Tasks",
			notifications: "Notifications",
			volume: "Volume",
			refresh: "Update",
			backup: {
			  title: "Backup",
			  backup: "Backup",
			  schedule: "Schedule emails"
			},
			user: {
			  profile: "Profile",
			  darkmode: "Dark mode",
			  lightmode: "Light mode",
			  language: "Language",
			  logout: "Exit"
			},
			i18n: {
			  language: "English",
			  language_short: "enUS"
			}
		  }
		},
		email: {
		  title: {
			sendEmail: "Send Email",
			scheduleEmail: "Schedule Email",
			emailList: "Email List"
		  },
		  fields: {
			sender: "Recipient",
			subject: "Subject",
			message: "Message",
			sendAt: "Sending Date",
			attachments: "Attachment(s)"
		  },
		  placeholders: {
			sender: "email@exemplo.com (separar múltiplos emails por vírgula)",
			subject: "Enter the email subject",
			message: "Enter your message here..."
		  },
		  validations: {
			senderRequired: "Recipient is required",
			invalidEmails: "One or more emails are invalid",
			subjectRequired: "Subject is required",
			messageRequired: "Message is required",
			dateInPast: "The date cannot be in the past"
		  },
		  buttons: {
			send: "Send",
			schedule: "Schedule",
			cancel: "Cancel",
			close: "Close",
			reschedule: "Reschedule",
			attachFile: "Attach File",
			showAdvanced: "Advanced Options",
			hideAdvanced: "Hide Advanced Options",
			showMore: "Show More",
			showLess: "Show Less",
			removeAttachment: "Remove attachment"
		  },
		  tabs: {
			send: "Send",
			schedule: "Schedule",
			list: "List",
			sent: "Sent",
			scheduled: "Scheduled"
		  },
		  status: {
			sent: "Sent",
			pending: "Pending",
			error: "Error",
			unknown: "Unknown"
		  },
		  errors: {
			loadEmails: "Error loading emails",
			apiError: "API error",
			cancelError: "Error canceling email",
			rescheduleError: "Error rescheduling email",
			exportError: "Error exporting emails"
		  },
		  helperTexts: {
			recipientCount: "{count} recipient(s)",
			attachmentCount: "{count} file(s) selected",
			sendAt: "Choose a future date and time for sending"
		  },
		  tooltips: {
			sender: "Enter one or more emails separated by commas",
			subject: "Enter an informative subject",
			message: "Write your message",
			sendAt: "Choose when the email will be sent",
			refresh: "Update",
			export: "Export",
			viewEmail: "View Email",
			moreOptions: "More Options"
		  },
		  dueDateNotification: {
			title: "Invoice notification dispatches",
			error: "An error occurred while dispatching notifications",
			close: "Close"
		  },
		  filters: {
			all: "All",
			sent: "Sent",
			pending: "Pending",
			error: "Errors"
		  },
		  search: {
			placeholder: "Search emails..."
		  },
		  noEmails: "No emails found",
		  noSubject: "(No subject)",
		  sentAt: "Sent on",
		  scheduledFor: "Scheduled for",
		  days: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday"
		  },
		  chart: {
			title: "Sending Statistics",
			lineChart: "Line Chart",
			barChart: "Bar Chart",
			pieChart: "Pie Chart",
			sentEmails: "Sent Emails",
			count: "Quantity",
			emails: "email(s)"
		  },
		  stats: {
			totalSent: "Total Sent",
			totalScheduled: "Total Scheduled",
			successRate: "Success Rate",
			averagePerDay: "Average per Day",
			delivered: "delivered",
			pending: "pending",
			failed: "failed",
			last30Days: "last 30 days"
		  },
		  table: {
			subject: "Subject",
			recipient: "Recipient",
			sentAt: "Sent on",
			scheduledFor: "Scheduled for",
			status: "Status",
			actions: "Actions"
		  },
		  emailDetails: {
			title: "Email Details",
			overview: "Overview",
			content: "Content",
			technical: "Technical",
			subject: "Subject",
			recipient: "Recipient",
			sentAt: "Sent on",
			scheduledFor: "Scheduled for",
			createdAt: "Created at",
			updatedAt: "Updated at",
			error: "Error",
			message: "Message",
			attachments: "Attachments",
			attachmentsPlaceholder: "Attachment preview not available",
			emailId: "Email ID",
			companyId: "Company ID",
			messageId: "Message ID",
			hasAttachments: "With Attachments",
			scheduled: "Scheduled"
		  },
		  ariaLabels: {
			dashboard: "Email Panel",
			tabs: "Email Tabs",
			sendTab: "Send Email Tab",
			scheduleTab: "Schedule Email Tab",
			listTab: "List Emails Tab",
			removeAttachment: "Remove attachment",
			sender: "Recipient Field",
			subject: "Subject Field",
			message: "Message Field",
			sendAt: "Sending Date Field",
			viewEmail: "View Email",
			moreOptions: "More Options",
			emailLists: "Email Lists",
			closeDetails: "Close Details",
			detailTabs: "Details Tabs",
			overviewTab: "Overview Tab",
			contentTab: "Content Tab",
			technicalTab: "Technical Tab"
		  }
		},
		success: {
		  emailSent: "Email sent successfully!",
		  emailScheduled: "Email scheduled successfully!",
		  emailCancelled: "Scheduling canceled successfully!",
		  emailRescheduled: "Email rescheduled successfully!"
		},
		todoList: {
		  title: "My Tasks",
		  tasksCompleted: "{{completed}} out of {{total}} tasks completed",
		  searchPlaceholder: "Search tasks...",
		  noCategory: "No Category",
		  menu: {
			markAsDone: "Mark as completed",
			pin: "Pin",
			select: "Select",
			taskDetails: "Task details",
			readAloud: "Read aloud",
			share: "Share",
			edit: "Edit",
			duplicate: "Duplicate",
			delete: "Delete"
		  },
		  success: {
			taskAdded: "Task added successfully!",
			taskUpdated: "Task updated successfully!",
			taskDeleted: "Task deleted successfully!",
			taskStatusUpdated: "Task status updated successfully!",
			categoryAdded: "Category added successfully!",
			categoryUpdated: "Category updated successfully!",
			categoryDeleted: "Category deleted successfully!"
		  },
		  errors: {
			fetchTasks: "Error fetching tasks. Please try again.",
			fetchCategories: "Error fetching categories. Please try again.",
			addTask: "Error adding task. Please try again.",
			updateTask: "Error updating task. Please try again.",
			deleteTask: "Error deleting task. Please try again.",
			updateTaskStatus: "Error updating task status. Please try again.",
			addCategory: "Error adding category. Please try again.",
			updateCategory: "Error updating category. Please try again.",
			deleteCategory: "Error deleting category. Please try again."
		  },
		  modal: {
			addTask: "Add Task",
			editTask: "Edit Task",
			addCategory: "Add Category",
			editCategory: "Edit Category",
			title: "Title",
			description: "Description",
			category: "Category",
			dueDate: "Due date",
			save: "Save",
			cancel: "Cancel"
		  }
		},
		taskCharges: {
		  chargesManagement: "Billing Management",
		  pendingCharges: "Pending Bills",
		  paidCharges: "Paid Bills",
		  client: "Client",
		  allClients: "All clients",
		  startDate: "Start date",
		  endDate: "End date",
		  task: "Task",
		  value: "Value",
		  dueDate: "Due Date",
		  employer: "Company",
		  chargesByEmployer: "Invoices by Companies",
		  noEmployerWarning: "This task has no company assigned.",
		  paymentDate: "Payment date",
		  actions: "Actions",
		  noPendingCharges: "There are no pending invoices",
		  noPaidCharges: "There are no paid invoices",
		  noClient: "Client not informed",
		  noDueDate: "No due date",
		  generatePDF: "Generate PDF",
		  sendEmail: "Send by Email",
		  registerPayment: "Record Payment",
		  pdfGenerated: "PDF generated successfully",
		  emailSent: "Email sent successfully",
		  paymentRegistered: "Payment recorded successfully",
		  errorLoadingCharges: "Error loading invoices",
		  errorGeneratingPDF: "Error generating PDF",
		  errorSendingEmail: "Error sending email",
		  errorRegisteringPayment: "Error recording payment",
		  rowsPerPage: "Items per page",
		  of: "of",
		  financialReport: "Financial Report",
		  report: "Report",
		  totalValue: "Total Value",
		  pendingValue: "Pending Value",
		  paidValue: "Received Value",
		  paidInPeriod: "Received in Period",
		  charges: "invoices",
		  chargesByClient: "Invoices by Client",
		  chargesByMonth: "Invoices by Month",
		  paymentsVsCharges: "Invoices vs. Payments",
		  payments: "Payments",
		  noDataAvailable: "No data available",
		  selectFiltersAndSearch: "Select filters and click search",
		  errorLoadingReport: "Error loading report",
		  paymentNotes: "Payment Notes",
		  paymentNotesPlaceholder: "Provide additional details about the payment (optional)",
		  sendReceipt: "Send receipt by email",
		  title: "Billing Information",
		  addChargeDescription: "Add an invoice to this task. Once added, you can generate PDFs, send by email, and record payments.",
		  addCharge: "Add Invoice",
		  noClientWarning: "Attention: This task has no associated client. Consider adding a client to facilitate billing management.",
		  status: "Status",
		  paid: "Paid",
		  pending: "Pending",
		  notes: "Notes",
		  invalidValue: "Invalid value. Please enter a value greater than zero.",
		  chargeAdded: "Invoice added successfully",
		  errorAddingCharge: "Error adding charge",
		  noEmailWarning: "No contact email for sending. Add an email to the customer or requester."
		},
		taskSubjects: {
		  manageSubjects: "Manage Subjects",
		  subjectName: "Subject",
		  subjectDescription: "Description",
		  subjectsList: "Existing Subjects",
		  noSubjects: "No subject registered",
		  errorLoading: "An error occurred while loading the subjects"
		},
		tasks: {
		  title: "Tasks",
		  search: "Search",
		  from: "From",
		  to: "To",
		  startDate: "Start Date",
		  endDate: "End Date",
		  dueDate: "Expiration Date",
		  creator: "Creator",
		  responsible: "Responsible",
		  category: "Category",
		  subject: "Subject",
		  allUsers: "All",
		  allCategories: "All",
		  allStatuses: "All",
		  allEmployers: "All companies",
		  allOptions: "All",
		  status: {
			title: "Status",
			pending: "Pending",
			inProgress: "In Progress",
			completed: "Completed",
			overdue: "Delayed"
		  },
		  privateTask: "Private task (only you can see)",
		  private: "Private",
		  public: "Public",
		  paid: "Paid",
		  pending: "Pending",
		  createdAt: "Created on",
		  lastUpdate: "Last Update",
		  privacy: "Privacy",
		  charge: "Charge",
		  recurrence: {
			title: "Recurrence",
			daily: "Daily",
			weekly: "Weekly",
			biweekly: "Biweekly",
			monthly: "Monthly",
			quarterly: "Quarterly",
			semiannual: "Biannual",
			annual: "Annual"
		  },
		  description: "Description",
		  today: "Today",
		  tomorrow: "Tomorrow",
		  dueToday: "Due today",
		  dueTomorrow: "Expires tomorrow",
		  daysOverdue: "Delayed by {{days}} days",
		  dueYesterday: "Expired yesterday",
		  overdueDays: "Delayed by {{days}} days",
		  dueInDays: "Expires in {{days}} days",
		  withAttachments: "With attachments",
		  employer: "Company",
		  employerName: "Company Name",
		  employerEmail: "Company Email",
		  employerPhone: "Company Phone",
		  employerDetails: "Company Details",
		  requesterName: "Requester Name",
		  requesterEmail: "Requester Email",
		  requesterDetails: "Requester Details",
		  chargeValue: "Billing Amount",
		  chargeStatus: "Payment Status",
		  paymentDate: "Payment Date",
		  paymentNotes: "Payment Notes",
		  paidBy: "Registered by",
		  viewInvoice: "View Invoice",
		  additionalInfo: "Additional Information",
		  recurrenceType: "Recurrence Type",
		  recurrenceDetails: "Recurrence Details",
		  recurrenceEndDate: "End Date",
		  recurrenceCount: "Occurrences Quantity",
		  nextOccurrence: "Next Occurrence",
		  hasNotes: "{{count}} notes",
		  hasAttachments: "{{count}} attachments",
		  buttons: {
			add: "Add Task",
			edit: "Edit",
			delete: "Delete",
			save: "Save",
			saving: "Saving...",
			cancel: "Cancel",
			close: "Close",
			refresh: "Update",
			clearFilters: "Clear filters",
			filter: "Filter",
			clear: "Clear filters",
			markDone: "Mark as Completed",
			markInProgress: "Mark as In Progress",
			showDeleted: "Show Deleted",
			markPending: "Mark as Pending",
			toggleFilters: "Show/Hide Filters",
			kanbanView: "Kanban View",
			listView: "List View",
			reports: "Reports",
			finances: "Finances",
			sort: "Sort",
			moreActions: "More Actions",
			options: "Options",
			print: "Print",
			export: "Export"
		  },
		  tabs: {
			all: "All",
			pending: "Pending",
			inProgress: "In Progress",
			completed: "Completed",
			paid: "Billed",
			unpaid: "In Billing",
			recurrent: "Recurring",
			notes: "Notes",
			attachments: "Attachments",
			timeline: "Timeline",
			charges: "Billing",
			details: "Details",
			deleted: "Deleted"
		  },
		  columns: {
			title: "Title",
			status: "Status",
			dueDate: "Due Date",
			responsible: "Responsible",
			category: "Category",
			actions: "Actions"
		  },
		  empty: {
			title: "No tasks found",
			description: "Click the button below to add a new task",
			noTasks: "No tasks found"
		  },
		  form: {
			title: "Title",
			description: "Description",
			dueDate: "Expiration Date",
			category: "Category",
			assignmentType: "Assignment Type",
			responsible: "Responsible",
			individual: "Individual",
			group: "Group",
			groupUsers: "Group Users",
			selectCategory: "Select a category",
			selectResponsible: "Select a responsible",
			selectField: "Select a field",
			completed: "Completed",
			titleRequired: "Title is required",
			categoryRequired: "Category is required",
			userRequired: "Responsible is required",
			usersRequired: "Select at least one user",
			private: "Private",
			privateInfo: "Only you can see this task",
			employer: "Company",
			subject: "Subject",
			selectSubject: "Select a subject",
			requesterName: "Requester Name",
			requesterEmail: "Requester Email",
			chargeInfo: "Billing Information",
			hasCharge: "This task has a charge",
			chargeValue: "Value",
			chargeValueRequired: "Charge value is mandatory",
			isPaid: "Charge made",
			paymentDate: "Payment Date",
			paymentNotes: "Payment Notes",
			recurrenceTitle: "Recurrence",
			recurrenceInfo: "You can set an end by date or number of occurrences. If both are filled, the first to occur will be considered.",
			isRecurrent: "This task is recurring",
			recurrenceType: "Recurrence frequency",
			recurrenceTypeRequired: "Recurrence type is mandatory",
			recurrenceEndDate: "End Date",
			recurrenceCount: "Occurrences Quantity"
		  },
		  modal: {
			add: "Add Task",
			edit: "Edit Task",
			loadError: "Error loading data"
		  },
		  notifications: {
			created: "Task created successfully",
			updated: "Task updated successfully",
			deleted: "Task deleted successfully",
			statusUpdated: "Status updated successfully",
			titleRequired: "Title is required",
			categoryRequired: "Category is required",
			userRequired: "Responsible is required",
			usersRequired: "Select at least one user",
			chargeValueRequired: "Charge value is mandatory",
			recurrenceTypeRequired: "Recurrence type is mandatory",
			submitError: "Error saving task",
			updateError: "Error updating task",
			deleteError: "Error deleting task"
		  },
		  confirmations: {
			delete: {
			  title: "Confirm deletion",
			  message: "Are you sure you want to delete this task?"
			}
		  },
		  sort: {
			dueDate: "Expiration Date",
			title: "Title",
			category: "Category"
		  },
		  errors: {
			loadFailed: "Error loading tasks"
		  },
		  indicators: {
			notes: "{{count}} notes",
			attachments: "{{count}} attachments",
			paid: "Paid: $ {{value}}",
			pendingPayment: "Pending: $ {{value}}",
			recurrent: "Recurring task"
		  },
		  kanban: {
			statusMode: "By Status",
			categoryMode: "By Category",
			todo: "To Do",
			inProgress: "In Progress",
			done: "Completed",
			emptyColumn: "No tasks in this column",
			emptyCategoryColumn: "No tasks in this category",
			filters: "Filters",
			clearFilters: "Clear Filters",
			loadError: "Error loading Kanban data",
			noCategories: "No category found"
		  },
		  timeline: {
			system: "System",
			fetchError: "Error loading task history",
			noEvents: "No events recorded for this task",
			taskCreated: "{{name}} created task '{{title}}'",
			taskUpdated: "{{name}} updated task",
			taskDeleted: "{{name}} deleted task",
			noteAdded: "{{name}} added a note",
			noteUpdated: "{{name}} updated a note",
			noteDeleted: "{{name}} removed a note",
			attachmentAdded: "{{name}} attached file '{{filename}}'",
			attachmentDeleted: "{{name}} removed attachment '{{filename}}'",
			statusCompletedBy: "{{name}} marked task as completed",
			statusPendingBy: "{{name}} marked task as pending",
			responsibleChanged: "{{name}} changed responsible from {{oldResponsible}} to {{newResponsible}}",
			usersAdded: "{{name}} added {{count}} users to the task",
			userRemoved: "{{name}} removed {{removed}} from the task",
			categoryChanged: "{{name}} changed category to '{{category}}'",
			dueDateChanged: "{{name}} changed due date to {{date}}",
			noDate: "no date",
			titleChanged: "{{name}} changed title to '{{title}}'",
			descriptionChanged: "{{name}} updated task description",
			employerAssociated: "{{name}} associated company '{{employer}}' with the task",
			employerChanged: "{{name}} changed associated company with the task",
			subjectAssociated: "{{name}} associated subject '{{subject}}' with the task",
			subjectChanged: "{{name}} changed task subject",
			chargeAdded: "{{name}} added a charge of {{value}}",
			paymentRegistered: "{{name}} registered payment of {{value}} on {{date}}",
			chargeEmailSent: "{{name}} sent billing email to {{email}}",
			receiptEmailSent: "{{name}} sent receipt by email to {{email}}",
			chargePdfGenerated: "{{name}} generated billing PDF",
			notificationSent: "{{name}} sent notification via {{type}}",
			notificationFailed: "{{name}} - failed to send notification: {{reason}}",
			overdueNotificationSent: "{{name}} received delay notification ({{minutes}} min)",
			recurrenceConfigured: "{{name}} set recurrence of type {{type}}",
			recurrenceCreated: "{{name}} created new recurring instance (#{{childId}})",
			recurrenceChildCreated: "{{name}} created task based on pattern #{{parentId}}",
			recurrenceLimitReached: "{{name}} - recurrence limit reached ({{count}})",
			recurrenceEndDateReached: "{{name}} - end date of recurrence reached ({{date}})",
			recurrenceSeriesUpdated: "{{name}} updated recurring tasks series ({{fields}})",
			recurrenceSeriesDeleted: "{{name}} deleted {{count}} tasks from recurring series",
			reportGenerated: "{{name}} generated report of type {{type}}",
			financialReportGenerated: "{{name}} generated financial report"
		  },
		  notes: {
			placeholder: "Add a note...",
			empty: "No notes found",
			deleted: "Note deleted successfully",
			deleteError: "Error deleting note"
		  },
		  attachments: {
			title: "Attachments",
			dropFiles: "Drag files here or click to upload",
			clickToUpload: "Formats: PDF, JPEG, PNG, DOC, XLS",
			allowedTypes: "Maximum size: 10MB",
			uploading: "Uploading file...",
			uploaded: "File uploaded successfully",
			deleted: "File deleted successfully",
			empty: "No attachments found",
			fileTooLarge: "The file exceeds the maximum allowed size ({{size}})",
			fileTypeNotAllowed: "File type not allowed",
			errorLoadingFiles: "Error loading files",
			preview: "Preview",
			clickToPreview: "Click to preview",
			uploadedBy: "Sent by",
			sort: {
			  newest: "Most recent",
			  oldest: "Oldest",
			  nameAsc: "Name (A-Z)",
			  nameDesc: "Name (Z-A)",
			  sizeAsc: "Size (smallest first)",
			  sizeDesc: "Size (largest first)"
			}
		  },
		  reports: {
			title: "Task Reports",
			filters: "Filters",
			totalTasks: "Total Tasks",
			completed: "Completed",
			pending: "Pending",
			overdue: "Overdue",
			weeklyProgress: "Weekly Progress",
			statusDistribution: "Status Distribution",
			userPerformance: "Performance by User",
			attachmentStats: "Attachment Statistics",
			noDataAvailable: "No data available"
		  },
		  export: {
			success: "Export completed successfully",
			error: "Error exporting data",
			downloadTemplate: "Download template",
			noData: "No tasks to export"
		  },
		  import: {
			title: "Import Tasks",
			steps: {
			  selectFile: "Select File",
			  mapFields: "Map Fields",
			  review: "Review",
			  result: "Result"
			},
			selectFilePrompt: "Select a CSV or Excel file with tasks to import",
			dragAndDrop: "Drag and drop the file here",
			or: "or",
			browse: "Browse file",
			supportedFormats: "Supported formats: CSV, XLSX, XLS",
			needTemplate: "Need a template to start?",
			downloadTemplate: "Download import template",
			processingFile: "Processing file...",
			mapFields: "Map the fields from your file to the system fields",
			mapFieldsInfo: "Select which columns from your file correspond to each field in the system. Only the 'Title' field is mandatory.",
			selectField: "Select a field",
			validation: {
			  titleRequired: "The 'Title' field is mandatory for import",
			  emptyTitle: "Empty Title",
			  invalidDate: "Invalid data: {{value}}",
			  invalidCategory: "Category '{{category}}' not found",
			  invalidUser: "User '{{user}}' not found",
			  dataErrors: "{{count}} records with issues"
			},
			validationErrors: "{{count}} issues found in the data",
			errorDetails: "Error details ({{count}})",
			rowError: "Row {{row}}: {{error}}",
			moreErrors: "...and {{count}} more errors",
			reviewAndImport: "Review the data and start the import",
			reviewInfo: "Check the data below before importing. You can view a summary and a sample of the data to be imported.",
			summary: "Summary",
			totalRecords: "Total records",
			validRecords: "Valid records",
			invalidRecords: "Invalid records",
			mappedFields: "Mapped fields",
			notMapped: "Not mapped",
			previewData: "Preview",
			showingFirst: "Showing the first {{count}} of {{total}} records",
			import: "Import",
			importingTasks: "Importing tasks...",
			pleaseWait: "Please wait while the tasks are being imported",
			importComplete: "Import completed",
			importFailed: "Import failed",
			totalProcessed: "Total processed",
			successful: "Success",
			failed: "Failure",
			errors: {
			  invalidFileType: "Invalid file type. Use CSV or Excel.",
			  emptyFile: "Empty file or no data",
			  parsingFailed: "Error processing the file",
			  readFailed: "Error reading the file",
			  processingFailed: "Error processing data",
			  validationFailed: "There are errors in data validation",
			  importFailed: "Failed to import data",
			  generalError: "Unknown error",
			  fetchCategoriesFailed: "Error loading categories",
			  fetchUsersFailed: "Error loading users",
			  templateGenerationFailed: "Error generating template"
			},
			successMessage: "{{count}} tasks were imported successfully",
			failureMessage: "Import failed. Check the errors and try again.",
			importAnother: "Import another file"
		  },
		  charges: {
			title: "Manage Invoices",
			pendingCharges: "Pending Bills",
			paidCharges: "Paid Bills",
			employer: "Company",
			allEmployers: "All companies",
			value: "Value",
			dueDate: "Expiration Date",
			paymentDate: "Payment Date",
			actions: "Actions",
			task: "Task",
			status: "Status",
			generatePDF: "Generate PDF",
			sendEmail: "Send Email",
			registerPayment: "Record Payment",
			addCharge: "Add Invoice",
			addChargeDescription: "Add a charge to this task by filling in the value below.",
			noEmployerWarning: "Attention: No company defined for this task. Charges without a company can hinder tracking.",
			noEmailWarning: "There is no contact email to send the charge.",
			pdfGenerated: "PDF generated successfully",
			emailSent: "Email sent successfully",
			paymentRegistered: "Payment recorded successfully",
			notes: "Notes",
			paid: "Paid",
			pending: "Pending",
			invalidValue: "Invalid value",
			paymentNotesPlaceholder: "Additional information about the payment...",
			sendReceipt: "Send receipt to customer",
			noPendingCharges: "No pending charges found",
			noPaidCharges: "No paid charges found",
			noEmployer: "No company",
			noDueDate: "No due date",
			rowsPerPage: "Lines per page",
			of: "of",
			financialReport: "Financial Report",
			report: "Report",
			paidInPeriod: "Paid in the period",
			totalValue: "Total Value",
			pendingValue: "Pending Value",
			paidValue: "Paid Value",
			charges: "invoices",
			selectFiltersAndSearch: "Select the filters and click Search",
			noDataAvailable: "No data available",
			chargesByEmployer: "Charges by Company",
			chargesByMonth: "Invoices by Month",
			paymentsVsCharges: "Invoices vs. Payments",
			payments: "Payments"
		  },
		  financialReports: {
			title: "Financial Reports"
		  },
		  filters: {
			title: "Filters",
			charges: "Billing",
			withCharges: "With Charges",
			paid: "Paid",
			pending: "Pending",
			hasAttachments: "Only with attachments",
			recurrent: "Only recurring tasks",
			loadError: "Error loading filter data"
		  },
		  taskCategories: {
			manageCategories: "Manage Categories",
			categoryName: "Category Name",
			nameRequired: "Category name is required",
			categoryCreated: "Category created successfully",
			categoryUpdated: "Category updated successfully",
			categoryDeleted: "Category deleted successfully",
			confirmDelete: "Are you sure you want to delete this category?",
			noCategories: "No category found",
			errorLoading: "Error loading categories",
			errorSaving: "Error saving category",
			errorDeleting: "Error deleting category",
			cannotDeleteUsed: "It is not possible to delete this category as it is being used in tasks",
			tasks: "tasks"
		  },
		  taskSubjects: {
			manageSubjects: "Manage Subjects",
			subjectName: "Subject Name",
			subjectDescription: "Description (optional)",
			nameRequired: "Subject name is required",
			subjectCreated: "Subject created successfully",
			subjectUpdated: "Subject updated successfully",
			subjectDeleted: "Subject deleted successfully",
			confirmDelete: "Are you sure you want to delete this subject?",
			noSubjects: "No subject registered",
			subjectsList: "List of Subjects",
			noDescription: "No description",
			errorLoading: "Error loading subjects",
			errorSaving: "Error saving subject",
			errorDeleting: "Error deleting subject",
			cannotDeleteUsed: "It is not possible to delete this subject as it is being used in tasks"
		  },
		  toggleView: "Toggle view",
		  toggleFilters: "Show/Hide Filters",
		  help: {
			tooltip: "Help on Task Management",
			title: "Help - Task Management",
			tabs: {
			  overview: "Overview",
			  interface: "Interface",
			  features: "Features",
			  kanban: "Kanban",
			  financial: "Financial",
			  tips: "Tips"
			},
			overview: {
			  title: "Overview of the Tasks Module",
			  introduction: "The Tasks module allows you to manage all activities of your team in an organized and efficient way. Here you can create, assign, track, and complete tasks, as well as generate reports and invoices.",
			  mainFeatures: "Key Features:",
			  listView: "List View",
			  listViewDesc: "View your tasks in a detailed list with filters and sorting.",
			  kanbanView: "Kanban View",
			  kanbanViewDesc: "Manage tasks in a status board or by categories.",
			  financial: "Financial Management",
			  financialDesc: "Create invoices associated with tasks and track payments.",
			  reports: "Reports and Statistics",
			  reportsDesc: "Track performance with detailed reports and graphs.",
			  benefits: "Benefits:",
			  benefitsText: "With task management, your team will be able to work in a more organized way, track deadlines, avoid forgetfulness, maintain activity history, and facilitate accountability to your clients. Automatic invoicing helps optimize the financial process, while reports provide valuable insights for management."
			},
			interface: {
			  title: "Interface and Navigation",
			  headerSection: "Header and Toolbar",
			  headerDesc: "At the top of the page, you will find:",
			  searchField: "Search Field",
			  searchFieldDesc: "Search tasks by title or related information",
			  filterButton: "Filters Button",
			  filterButtonDesc: "Show/hide advanced filters panel",
			  reportButton: "Reports Button",
			  reportButtonDesc: "Access the reports and statistics section",
			  financialButton: "Financial Button",
			  financialButtonDesc: "Menu with options to manage charges",
			  viewToggle: "View Switcher",
			  viewToggleDesc: "Switches between list and kanban view",
			  addButton: "Add Button",
			  addButtonDesc: "Create a new task",
			  tabsSection: "Status Tabs",
			  tabsDesc: "The tabs allow you to quickly filter tasks by status:",
			  allTab: "All",
			  allTabDesc: "Show all tasks",
			  pendingTab: "Pending",
			  pendingTabDesc: "Tasks that are not yet completed",
			  inProgressTab: "In Progress",
			  inProgressTabDesc: "Tasks that are in progress",
			  completedTab: "Completed",
			  completedTabDesc: "Completed tasks",
			  paidTab: "Paid",
			  paidTabDesc: "Tasks with paid charges",
			  unpaidTab: "Unpaid",
			  unpaidTabDesc: "Tasks with pending payment charges",
			  recurrentTab: "Recurring",
			  recurrentTabDesc: "Tasks that repeat automatically",
			  tableSection: "Tasks Table",
			  tableDesc: "The table displays your tasks with the following columns:",
			  titleColumn: "Title",
			  titleColumnDesc: "Task name with attachment and notes indicators",
			  statusColumn: "Status",
			  statusColumnDesc: "Current status of the task (Pending, In Progress, Completed, Delayed)",
			  dueDateColumn: "Expiration Date",
			  dueDateColumnDesc: "Deadline for task completion",
			  responsibleColumn: "Responsible",
			  responsibleColumnDesc: "User assigned to perform the task",
			  categoryColumn: "Category",
			  categoryColumnDesc: "Task classification",
			  actionsColumn: "Actions",
			  actionsColumnDesc: "Buttons to mark as completed, edit, and delete"
			},
			features: {
			  title: "Detailed Features",
			  taskCreation: "Task Creation and Editing",
			  taskCreationDesc: "To create a new task, click on the 'Add' button in the top right corner. The form allows you to configure:",
			  basicInfo: "Basic Information",
			  basicInfoDesc: "Title, description, due date, category, and subject",
			  responsibility: "Responsibility",
			  responsibilityDesc: "Individual or group assignment for multiple users",
			  clientInfo: "Customer Information",
			  clientInfoDesc: "Link to a company and requester's data",
			  charging: "Billing Settings",
			  chargingDesc: "Set payment amount and status",
			  recurrence: "Recurrence Settings",
			  recurrenceDesc: "Set frequency, end date or number of occurrences",
			  taskEditingNote: "Task editing uses the same form, allowing you to change any parameter at any time.",
			  filtering: "Advanced Filters",
			  filteringDesc: "The filter panel allows you to refine your view based on various criteria:",
			  dateFilter: "Date Filters",
			  dateFilterDesc: "Specific period with start and end date",
			  userFilter: "User Filter",
			  userFilterDesc: "Tasks assigned to a specific user",
			  categoryFilter: "Category Filter",
			  categoryFilterDesc: "Tasks from a specific category",
			  employerFilter: "Company Filter",
			  employerFilterDesc: "Tasks associated with a specific company",
			  statusFilter: "Status Filter",
			  statusFilterDesc: "Pending, completed, in progress or overdue",
			  chargeFilter: "Billing Filter",
			  chargeFilterDesc: "Tasks with billing, paid or pending",
			  attachmentFilter: "Attachment Filter",
			  attachmentFilterDesc: "Tasks with attachments",
			  recurrenceFilter: "Recurrence Filter",
			  recurrenceFilterDesc: "Only recurring tasks",
			  sorting: "Sorting and Organization",
			  sortingDesc: "In addition to filters, you can sort tasks by various criteria:",
			  dueDateSort: "Expiration Date",
			  dueDateSortDesc: "Prioritize tasks by deadline",
			  titleSort: "Title",
			  titleSortDesc: "Alphabetically sort by title",
			  categorySort: "Category",
			  categorySortDesc: "Group tasks by category",
			  importExport: "Import and Export",
			  importDesc: "The import feature allows you to load multiple tasks at once through CSV or Excel files:",
			  importSteps: "Import Steps",
			  importStepsDesc: "File upload, field mapping, review and confirmation",
			  exportFormats: "Export Formats",
			  exportFormatsDesc: "Export your tasks to PDF, Excel or print directly",
			  categories: "Categories and Subjects",
			  categoriesDesc: "The system allows you to manage categories and subjects for better organization:",
			  categoryManagement: "Category Management",
			  categoryManagementDesc: "Create, edit and delete categories to classify your tasks",
			  subjectManagement: "Subject Management",
			  subjectManagementDesc: "Set up subjects to add a second dimension of classification",
			  details: "Task Details",
			  detailsDesc: "When you click on a task, you access the details modal with several tabs:",
			  notesTab: "Notes",
			  notesTabDesc: "Add notes to document progress",
			  attachmentsTab: "Attachments",
			  attachmentsTabDesc: "Upload files related to the task",
			  timelineTab: "Timeline",
			  timelineTabDesc: "View the complete action history of the task",
			  chargesTab: "Billing",
			  chargesTabDesc: "Manage values and payments associated with the task",
			  detailsTab: "Details",
			  detailsTabDesc: "Complete information about company, requester, and settings"
			},
			kanban: {
			  title: "Kanban View",
			  introduction: "Kanban view provides a visual perspective of the workflow, allowing you to manage tasks through columns representing different states or categories.",
			  modes: "View Modes",
			  modesDesc: "Kanban offers two main viewing modes:",
			  statusMode: "By Status",
			  statusModeDesc: "Organizes tasks in columns of To Do, In Progress, and Done",
			  categoryMode: "By Category",
			  categoryModeDesc: "Groups tasks by category, allowing you to view the distribution of work",
			  dragDrop: "Drag and Drop",
			  dragDropDesc: "The main advantage of Kanban is the drag and drop functionality:",
			  statusChange: "Status Change",
			  statusChangeDesc: "In Status mode, drag tasks between columns to change their status",
			  categoryChange: "Category Change",
			  categoryChangeDesc: "In Category mode, drag to reclassify the task",
			  dragDropTip: "Tip: To quickly change multiple tasks, use Kanban view instead of opening and editing each task individually.",
			  filtering: "Filtering in Kanban",
			  filteringDesc: "Even in Kanban view, you can use advanced filters:",
			  filterAccess: "Access to Filters",
			  filterAccessDesc: "Click on the filter icon to show/hide the filter panel",
			  filterEffect: "Filter Effects",
			  filterEffectDesc: "Filters affect all columns simultaneously, showing only tasks that match the criteria",
			  cards: "Task Cards",
			  cardsDesc: "Cards in Kanban display important information in a compact way:",
			  cardInfo: "Visible Information",
			  cardInfoDesc: "Title, assignee, due date, category, and attachment/notes indicators",
			  cardActions: "Quick Actions",
			  cardActionsDesc: "Buttons to mark as done, edit, and delete directly on the card",
			  cardClick: "Click on the Card",
			  cardClickDesc: "Click on any card to open the full details of the task"
			},
			financial: {
			  title: "Financial Management",
			  introduction: "The tasks module offers integrated financial features, allowing you to create charges associated with tasks, manage payments, and generate financial reports.",
			  taskCharges: "Charges on Tasks",
			  taskChargesDesc: "How to add charges to a task:",
			  createCharge: "Charge Creation",
			  createChargeDesc: "When creating or editing a task, activate the 'This task has a charge' option in the Billing Information section",
			  chargeSettings: "Billing Settings",
			  chargeSettingsDesc: "Set the amount to be charged and indicate if it has already been paid",
			  existingCharge: "Tasks with Charges",
			  existingChargeDesc: "Tasks with charges display a dollar sign icon. Green for paid, red for pending",
			  chargeManagement: "Billing Management",
			  chargeManagementDesc: "To manage all charges in one place:",
			  chargesPage: "Billing Page",
			  chargesPageDesc: "Access through the Financial button > Manage Charges",
			  chargeTabs: "Billing Tabs",
			  chargeTabsDesc: "Switch between pending and paid charges",
			  chargeActions: "Collection Actions",
			  chargeActionsDesc: "Generate PDF, send by email and record payment",
			  chargeFilters: "Collection Filters",
			  chargeFiltersDesc: "Filter by company, due date and other criteria",
			  reports: "Financial Reports",
			  reportsDesc: "Track financial performance through reports:",
			  reportAccess: "Access to Reports",
			  reportAccessDesc: "Financial Button > Financial Reports",
			  reportSummary: "Financial Summary",
			  reportSummaryDesc: "View totals of charges, pending and received values",
			  reportCharts: "Financial Charts",
			  reportChartsDesc: "Analyze data by company, by month and compare charges with payments",
			  reportFilters: "Reports Customization",
			  reportFiltersDesc: "Filter by company, period and other criteria for specific analysis",
			  invoicing: "Billing and Communication",
			  invoicingDesc: "Communicate with customers about charges:",
			  pdfGeneration: "PDF Generation",
			  pdfGenerationDesc: "Create professional billing documents for sending to customers",
			  emailSending: "Send by Email",
			  emailSendingDesc: "Send charges directly to customers through the system",
			  receiptSending: "Receipt Sending",
			  receiptSendingDesc: "After recording payments, send automatic receipts"
			},
			tips: {
			  title: "Tips and Best Practices",
			  organization: "Efficient Organization",
			  useCategories: "Use Consistent Categories",
			  useCategoriesDesc: "Define a standard set of categories to facilitate organization and reports",
			  namingConvention: "Standardize Titles",
			  namingConventionDesc: "Adopt a naming convention for tasks to facilitate search (e.g. [Client] - Main Action)",
			  useDescription: "Detailed Descriptions",
			  useDescriptionDesc: "Include complete information in the description so that anyone understands what needs to be done",
			  teamWork: "Teamwork",
			  useNotes: "Use Notes for Communication",
			  useNotesDesc: "Document progress and challenges in notes to keep the team informed",
			  groupAssignment: "Group Assignment",
			  groupAssignmentDesc: "For complex tasks, assign to multiple users for collaboration",
			  attachRelevantFiles: "Attach Relevant Files",
			  attachRelevantFilesDesc: "Keep all necessary files attached to the task for easy access",
			  timeManagement: "Time Management",
			  setRealisticDates: "Set Realistic Deadlines",
			  setRealisticDatesDesc: "Avoid impossible deadlines to keep the team motivated",
			  useInProgress: "Use the 'In Progress' Status",
			  useInProgressDesc: "When starting work on a task, move it to 'In Progress' for better visibility",
			  reviewDailyTasks: "Review Tasks Daily",
			  reviewDailyTasksDesc: "Start the day by checking pending tasks and organize the Kanban view",
			  financialBestPractices: "Financial Best Practices",
			  linkToEmployer: "Link to Companies",
			  linkToEmployerDesc: "Always associate tasks with charges to companies to facilitate billing",
			  regularReports: "Regular Reports",
			  regularReportsDesc: "Generate weekly or monthly financial reports to track receipts",
			  documentPayments: "Document Payments",
			  documentPaymentsDesc: "When registering payments, add detailed information in the observations",
			  kanbanUsage: "Efficient Use of Kanban",
			  statusModeForWorkflow: "Status Mode for Workflow",
			  statusModeForWorkflowDesc: "Use status mode to manage tasks in progress on a daily basis",
			  categoryModeForPlanning: "Category Mode for Planning",
			  categoryModeForPlanningDesc: "Use category mode to assess workload distribution and do planning",
			  limitWIP: "Limit Work in Progress",
			  limitWIPDesc: "Avoid having too many tasks in progress simultaneously to improve productivity"
			}
		  }
		},
		taskCategories: {
		  manageCategories: "Manage Categories",
		  categoryName: "Category",
		  nameRequired: "Category name is required",
		  noCategories: "No categories",
		  tasks: "Tasks"
		},
		kanban: {
		  title: "Kanban Board",
		  openTickets: "Open",
		  queue: {
			title: "Board by Sector",
			selectQueue: "Select a department",
			selectQueuePrompt: "Select a sector to view the kanban board",
			newLane: {
			  title: "New Column",
			  name: "Column name",
			  color: "Column color",
			  create: "Create Column",
			  success: "Column created successfully",
			  error: "Error creating column"
			},
			errors: {
			  loadQueues: "Error loading sectors",
			  loadLanes: "Error loading columns",
			  loadTickets: "Error loading tickets",
			  moveCard: "Error moving ticket",
			  deleteTag: "Error deleting column",
			  updateTag: "Error updating column"
			},
			success: {
			  cardMoved: "Ticket moved successfully",
			  tagDeleted: "Column removed successfully",
			  tagUpdated: "Column updated successfully"
			}
		  },
		  filters: {
			searchPlaceholder: "Search tickets...",
			dateFrom: "Start date",
			dateTo: "End date",
			users: "Filter by attendant",
			status: "Ticket status",
			queues: "Departments",
			noResults: "No results found"
		  },
		  card: {
			ticketNumber: "Ticket #",
			customer: "Client",
			lastMessage: "Last message",
			assignedTo: "Assigned to",
			status: "Status",
			queue: "Sector",
			createdAt: "Created at",
			updatedAt: "Updated at",
			noMessage: "No messages"
		  },
		  lane: {
			actions: {
			  edit: "Edit column",
			  delete: "Delete column",
			  confirm: "Confirm",
			  cancel: "Cancel"
			},
			edit: {
			  title: "Edit Column",
			  name: "Name",
			  color: "Color",
			  save: "Save changes"
			},
			delete: {
			  title: "Delete Column",
			  message: "Are you sure you want to delete this column?",
			  warning: "All tickets will be moved to the default column"
			},
			tickets: "tickets"
		  },
		  actions: {
			settings: "Board settings",
			newLane: "New column",
			refresh: "Update board",
			expand: "Expand",
			collapse: "Collapse"
		  },
		  settings: {
			title: "Board Settings",
			general: {
			  title: "General Settings",
			  autoRefresh: "Automatic update",
			  refreshInterval: "Update interval",
			  cardSize: "Card size",
			  compactView: "Compact view"
			},
			display: {
			  title: "Display",
			  showAvatars: "Show avatars",
			  showTags: "Show labels",
			  showPriority: "Show priority",
			  showDueDate: "Show deadline"
			}
		  },
		  tooltips: {
			addLane: "Add new column",
			editLane: "Edit column",
			deleteLane: "Delete column",
			moveTicket: "Move ticket",
			openTicket: "Open ticket"
		  },
		  emptyState: {
			title: "Select a department to view the Kanban",
			message: "To view tickets on the Kanban board, first select a department from the menu above.",
			buttonText: "Select Department"
		  },
		  confirmations: {
			deleteLane: {
			  title: "Delete Column",
			  message: "Are you sure you want to delete this column? This action cannot be undone."
			}
		  },
		  notifications: {
			ticketMoved: "Ticket moved to {lane}",
			laneCreated: "Column created successfully",
			laneUpdated: "Column updated successfully",
			laneDeleted: "Column deleted successfully"
		  },
		  infoModal: {
			title: "Kanban Board Information",
			tooltipInfo: "Information about Kanban",
			closeButton: "Close",
			scheduleTimeTitle: "Scheduling Time:",
			scheduleTimeDescription: "All schedules will be sent between 18:00 and 18:30.",
			recurringScheduleTitle: "Recurring Schedule:",
			recurringStep1: "Go to the \"Campaign Tags\" tab.",
			recurringStep2: "Create new tags if necessary.",
			recurringStep3: "Follow these steps:",
			subStep1: "Go to the settings gear.",
			subStep2: "Select one of the available boards.",
			subStep3: "Change the message that will be sent.",
			subStep4: "If necessary, choose a file to be sent.",
			subStep5: "Choose the scheduling frequency (every how many days).",
			subStep6: "Click on \"Save\".",
			noActiveCampaignsTitle: "Tickets Without Active Campaigns:",
			noActiveCampaignsDescription: "All tickets without active campaigns will enter the \"Open\" board.",
			createCampaignTitle: "Create a Campaign:",
			createCampaignDescription: "To create a campaign, drag the ticket to the campaign board of your choice.",
			moveTicketsTitle: "Move Tickets between Boards:",
			moveTicketsStep1: "When moving a ticket to a board, the scheduling will be based on the board's settings.",
			moveTicketsStep2: "When moving a ticket to another board, existing schedules will be deleted and a new schedule will be created according to the chosen board.",
			moveTicketsStep3: "When moving a ticket back to the \"Open\" board, existing schedules of the ticket will be deleted."
		  }
		},
		transferTicketsModal: {
		  title: "Transfer Tickets",
		  warning: "Attention! This action cannot be undone.",
		  description: "Select a connection to transfer the tickets before deleting this connection. All open tickets will be moved to the selected connection.",
		  selectLabel: "Select the destination connection",
		  sourceConnection: {
			label: "Source connection",
			status: {
			  active: "Active",
			  inactive: "Inactive"
			}
		  },
		  buttons: {
			cancel: "Cancel",
			confirm: "Transfer and Delete"
		  },
		  success: "Tickets transferred successfully!",
		  error: "Error transferring tickets. Please try again."
		},
		queueIntegration: {
		  title: "Integrations",
		  table: {
			id: "ID",
			type: "Type",
			name: "Name",
			projectName: "Project Name",
			language: "Language",
			lastUpdate: "Last update",
			actions: "Actions"
		  },
		  buttons: {
			add: "Add Project"
		  },
		  toasts: {
			deleted: "Integration deleted successfully."
		  },
		  searchPlaceholder: "Search...",
		  confirmationModal: {
			deleteTitle: "Delete",
			deleteMessage: "Are you sure? This action cannot be undone! and will be removed from the associated sectors and connections"
		  },
		  form: {
			n8nApiKey: "n8n API Key"
		  }
		},
		files: {
		  modal: {
			addTitle: "New File List",
			editTitle: "Edit File List",
			name: "List Name",
			description: "Description",
			add: "Add",
			saveChanges: "Save Changes",
			cancel: "Cancel",
			noPreview: "No preview available"
		  },
		  buttons: {
			add: "Add",
			edit: "Edit",
			delete: "Delete",
			upload: "Choose File",
			download: "Download",
			close: "Close",
			openPdf: "Open PDF",
			selectFile: "Select File",
			addList: "New List"
		  },
		  deleteDialog: {
			title: "Delete File List",
			message: "This action will delete all files associated with this list. This action cannot be undone."
		  },
		  deleteFileDialog: {
			title: "Delete File",
			message: "Are you sure you want to delete this file? This action cannot be undone."
		  },
		  empty: {
			title: "No file lists found",
			message: "Create your first file list to share in your campaigns."
		  },
		  tooltips: {
			edit: "Edit list",
			delete: "Delete list",
			view: "View file",
			download: "Download file"
		  },
		  searchPlaceholder: "Search file lists...",
		  filesList: "Files in List",
		  emptyFileList: "No files in this list. Upload your first file.",
		  preview: {
			title: "File Preview",
			description: "Description",
			details: "File Details",
			noPreview: "Preview not available for this file",
			pdfMessage: "Click the button below to open the PDF",
			notSupported: "Preview not available for this file type"
		  },
		  table: {
			name: "Name",
			type: "Type",
			size: "Size",
			actions: "Actions",
			unknownType: "Unknown type"
		  },
		  validation: {
			nameRequired: "Name is required",
			nameMin: "Name must have at least 2 characters",
			nameMax: "Name must have a maximum of 100 characters",
			descriptionMax: "Description must have a maximum of 500 characters"
		  },
		  toasts: {
			added: "File list created successfully!",
			updated: "File list updated successfully!",
			deleted: "File list deleted successfully!",
			fileDeleted: "File deleted successfully!",
			fileAddedToList: "File added successfully!",
			filesAddedToList: "{count} files added successfully!",
			fetchError: "Error fetching file lists.",
			error: "An error occurred. Please try again.",
			deleteError: "Error deleting file list.",
			deleteFileError: "Error deleting file.",
			uploadError: "Error uploading file.",
			uploadMultipleError: "Error uploading files."
		  },
		  noResults: "No results found for the search."
		},
		messagesAPI: {
		  title: "API",
		  contactNumber: "Contact number",
		  contactName: "Contact name",
		  contactEmail: "Contact's email",
		  statusCompany: "Company status",
		  searchParam: "Contact name or number",
		  pageNumber: "Page number for pagination",
		  doc: "Documentation for message sending:",
		  formMethod: "Sending method:",
		  token: "Registered token",
		  apiToken: "Registered Token",
		  ticketId: "Ticket ID",
		  queueId: "Sector ID",
		  status: "Ticket status",
		  id: "Invoice ID",
		  updateFields: "Data to be updated",
		  updateData: "Data to be updated",
		  queue: "Sector",
		  tags: "Tags",
		  tagId: "Tag ID",
		  invoiceId: "Invoice ID",
		  companyId: "Company ID",
		  body: "Message",
		  contactData: "Contact's data",
		  contactId: "Contact ID",
		  file: "File",
		  number: "Number",
		  pdfLink: "PDF link",
		  medias: "Media",
		  imageLink: "Image link",
		  audioLink: "Audio link",
		  textMessage: {
			number: "Number",
			body: "Message",
			token: "Registered token"
		  },
		  mediaMessage: {
			number: "Number",
			body: "File name",
			media: "File",
			token: "Registered token"
		  },
		  buttons: {
			submit: "Send"
		  },
		  helpTexts: {
			textMsg: {
			  title: "Text message",
			  info: "Below is the list of information required for ",
			  endpoint: "Endpoint: ",
			  method: "Method: ",
			  headers: "Headers: ",
			  body: "Body: "
			},
			test: "Sending test: ",
			mediaMsg: {
			  title: "Media message",
			  info: "Below is the list of information required for ",
			  endpoint: "Endpoint: ",
			  method: "Method: ",
			  headers: "Headers: ",
			  body: "Body: ",
			  formData: "FormData: "
			},
			instructions: "Instructions",
			notes: {
			  title: "Important notes",
			  textA: "Before sending messages, it is necessary to register the token linked to the connection that will send the messages. <br/>To register, access the 'Connections' menu, click on the edit button of the connection, and enter the token in the appropriate field.",
			  textB: {
				title: "The number for sending must not have masks or special characters and must be composed of:",
				partA: "Country Code",
				partB: "Area Code",
				partC: "Number"
			  }
			},
			info: "Below is the list of information required for ",
			endpoint: "Endpoint: ",
			method: "Method: ",
			headers: "Headers: ",
			body: "Body: "
		  },
		  apiRoutes: {
			token: "Token for connection validation"
		  }
		},
		notifications: {
		  title: "Messages",
		  message: "message",
		  messages: "messages",
		  noTickets: "No unread messages.",
		  clearAll: "Clear all",
		  cleared: "Notifications cleared successfully!",
		  clearError: "Error clearing notifications!",
		  newMessage: "New message",
		  permissionGranted: "Permission for notifications granted!",
		  permissionDenied: "Permission for notifications denied. Activate in the browser settings.",
		  permissionError: "Error requesting permission for notifications.",
		  enableNotifications: "Enable notifications"
		},
		quickMessages: {
		  title: "Quick Replies",
		  searchPlaceholder: "Search...",
		  noAttachment: "No attachment",
		  permission: "Only administrators and supervisors can edit",
		  confirmationModal: {
			deleteTitle: "Delete quick response",
			deleteMessage: "This action is irreversible! Do you want to proceed?"
		  },
		  buttons: {
			add: "Add Quick Response",
			attach: "Attach File",
			cancel: "Cancel",
			edit: "Edit",
			delete: "Delete",
			startRecording: "Start Recording",
			stopRecording: "Stop Recording",
			playAudio: "Play Audio",
			save: "Save"
		  },
		  toasts: {
			success: "Quick response added successfully!",
			deleted: "Quick response removed successfully!",
			error: "Error processing quick response"
		  },
		  dialog: {
			title: "Quick Response",
			shortcode: "Shortcut",
			message: "Response",
			save: "Save",
			cancel: "Cancel",
			geral: "Allow editing",
			add: "Add",
			edit: "Edit",
			visao: "Allow preview",
			no: "No",
			yes: "Yes",
			geralHelper: "Allow all users to edit this quick response",
			recordedAudio: "Recorded audio",
			validation: {
			  required: "This field is required",
			  minLength: "Minimum of 3 characters",
			  maxLength: "Maximum of 255 characters"
			}
		  },
		  table: {
			shortcode: "Shortcut",
			message: "Message",
			actions: "Actions",
			mediaName: "File Name",
			status: "Status",
			media: "Media",
			permissions: "Permissions",
			createdAt: "Created at",
			updatedAt: "Updated at"
		  }
		},
		mediaInput: {
		  previewTitle: "Media Preview",
		  caption: "Add a caption...",
		  captions: "Captions",
		  addTag: "Add tag (hashtag)",
		  duplicate: "Duplicate",
		  attach: "Attach file(s)",
		  contact: "Contacts",
		  metadata: {
			title: "Title",
			name: "Name",
			type: "Type",
			size: "Size",
			modified: "Modified on:"
		  },
		  buttons: {
			crop: "Crop image",
			draw: "Draw on image",
			zoomIn: "Zoom in",
			showMetadata: "Show file metadata",
			zoomOut: "Zoom out",
			addTag: "Add hashtag",
			duplicate: "Duplicate",
			delete: "Delete",
			cancel: "Cancel",
			send: "Send",
			fullscreen: "Enter full screen",
			download: "Download",
			copy: "Copy"
		  }
		},
		messageVariablesPicker: {
		  label: "Available variables",
		  vars: {
			contactFirstName: "First Name",
			contactName: "Name",
			ticketId: "Ticket ID",
			user: "User",
			greeting: "Greeting",
			ms: "Milliseconds",
			hour: "Time",
			date: "Date",
			queue: "Sector",
			connection: "Connection",
			dataHora: "Date and Time",
			protocolNumber: "Protocol Number",
			nameCompany: "Company Name"
		  }
		},
		contactLists: {
		  dialog: {
			add: "New Contact List",
			edit: "Edit Contact List",
			name: "List Name",
			cancel: "Cancel",
			okAdd: "Add",
			okEdit: "Save"
		  },
		  confirmationModal: {
			deleteTitle: "Delete contact list",
			deleteMessage: "This action cannot be undone. All contacts in this list will be deleted."
		  },
		  empty: {
			title: "No contact lists found",
			message: "Create your first contact list to start campaigns.",
			button: "Create List"
		  },
		  searchPlaceholder: "Search for contact lists...",
		  toasts: {
			fetchError: "Error while searching for contact lists.",
			deleted: "Contact list deleted successfully!",
			added: "Contact list created successfully!",
			edited: "Contact list updated successfully!",
			saveError: "Error while saving contact list."
		  },
		  buttons: {
			add: "New List",
			edit: "Edit",
			delete: "Delete"
		  },
		  table: {
			name: "Name",
			contacts: "Contacts",
			actions: "Actions"
		  }
		},
		announcements: {
		  active: "Active",
		  inactive: "Inactive",
		  title: "Informative",
		  searchPlaceholder: "Search",
		  buttons: {
			add: "New Newsletter",
			contactLists: "Newsletter Lists"
		  },
		  empty: {
			title: "No newsletters available",
			message: "No announcements found. Click on 'New Newsletter' to create the first one!",
			button: "New Newsletter"
		  },
		  form: {
			title: "Newsletter Title",
			uploadMedia: "Attach file(s)",
			priority: "Newsletter Priority"
		  },
		  table: {
			priority: "Priority",
			title: "Title",
			text: "Text",
			mediaName: "File",
			status: "Status",
			actions: "Actions",
			createdAt: "Creation Date"
		  },
		  modal: {
			addTitle: "Creating new newsletter",
			editTitle: "Editing newsletter"
		  },
		  priority: {
			low: "Low",
			medium: "Media",
			high: "High"
		  },
		  dialog: {
			edit: "Newsletter Edition",
			add: "New Newsletter",
			update: "Edit Newsletter",
			readonly: "View Only",
			form: {
			  priority: "Priority",
			  title: "Title",
			  text: "Text",
			  mediaPath: "File",
			  status: "Status"
			},
			buttons: {
			  add: "Add",
			  edit: "Update",
			  okadd: "Ok",
			  cancel: "Cancel",
			  close: "Close",
			  attach: "Attach File"
			}
		  },
		  confirmationModal: {
			deleteTitle: "Delete",
			deleteMessage: "This action cannot be undone."
		  },
		  toasts: {
			success: "Operation successful",
			deleted: "Record deleted"
		  },
		  tooltips: {
			addNew: "Add a new newsletter",
			listView: "Switch to list view",
			cardView: "Switch to card view"
		  }
		},
		queues: {
		  title: "Departments & Chatbot",
		  noDataFound: "No sector found.",
		  noDataFoundMessage: "It seems there are no sectors registered yet. Add a new one and optimize your communication!",
		  table: {
			id: "ID",
			name: "Name",
			color: "Color",
			greeting: "Greeting message",
			actions: "Actions",
			orderQueue: "Sector sorting (bot)"
		  },
		  buttons: {
			add: "Add department"
		  },
		  confirmationModal: {
			deleteTitle: "Delete",
			deleteMessage: "Are you sure? This action cannot be undone! The attendances of this sector will continue to exist, but will no longer have any sector assigned."
		  },
		  toasts: {
			success: "Operation successful",
			deleted: "Sector successfully deleted"
		  }
		},
		queueSelect: {
		  inputLabel: "Departments"
		},
		users: {
		  title: "Users",
		  userUser: "Make SuperAdmin",
		  table: {
			name: "Name",
			email: "Email",
			profile: "Profile",
			status: "Status",
			actions: "Actions"
		  },
		  buttons: {
			add: "Add User",
			edit: "Edit User",
			delete: "Delete User",
			duplicate: "Duplicate User",
			listView: "List View",
			cardView: "Card View"
		  },
		  labels: {
			selectCompany: "Select Company",
			allCompanies: "All Companies"
		  },
		  roles: {
			admin: "Administrator",
			user: "User",
			superv: "Supervisor"
		  },
		  profile: {
			admin: "Administrator",
			user: "User",
			superv: "Supervisor"
		  },
		  confirmationModal: {
			deleteTitle: "Confirm deletion",
			deleteMessage: "Are you sure you want to delete this user?"
		  },
		  toasts: {
			deleted: "User deleted successfully",
			deleteError: "Error deleting user",
			duplicated: "User duplicated successfully",
			duplicateError: "Error duplicating user",
			loadUsersError: "Error loading users",
			loadCompaniesError: "Error loading companies"
		  },
		  status: {
			online: "Online:",
			offline: "Offline:"
		  },
		  superUserIndicator: "Super Admin User"
		},
		stripe: {
		  title: "Stripe Settings",
		  publicKey: "Public Key",
		  secretKey: "Secret Key",
		  webhookSecret: "Webhook Key",
		  webhookUrl: "Webhook URL",
		  publicKeyTooltip: "Stripe public key (pk_...)",
		  secretKeyTooltip: "Stripe secret key (sk_...)",
		  webhookSecretTooltip: "Webhook secret key (whsec_...)",
		  webhookUrlTooltip: "Use this URL when setting up the webhook in the Stripe dashboard"
		},
		compaies: {
		  title: {
			main: "Companies",
			add: "Register Company",
			edit: "Edit Company"
		  },
		  table: {
			id: "ID",
			status: "Active",
			name: "Name",
			email: "Email",
			passwordDefault: "Password",
			numberAttendants: "Attendees",
			numberConections: "Connections",
			value: "Value",
			namePlan: "Plan Name",
			numberQueues: "Departments",
			useCampaigns: "Campaigns",
			useExternalApi: "Rest API",
			useFacebook: "Facebook",
			useInstagram: "Instagram",
			useWhatsapp: "Whatsapp",
			useInternalChat: "Internal Chat",
			useSchedules: "Scheduling",
			createdAt: "Created At",
			dueDate: "Due Date",
			lastLogin: "Last Login",
			folderSize: "Folder Size",
			numberOfFiles: "Number of Files",
			lastUpdate: "Last Update",
			actions: "Actions"
		  },
		  buttons: {
			add: "Add company",
			cancel: "Cancel changes",
			okAdd: "Save",
			okEdit: "Edit"
		  },
		  toasts: {
			deleted: "Company deleted successfully."
		  },
		  confirmationModal: {
			deleteTitle: "Delete",
			deleteMessage: "All company data will be lost. Open tickets from this user will be moved to the department."
		  }
		},
		helps: {
		  title: "Help Center",
		  videoTab: "Help Videos",
		  apiTab: "API Documentation",
		  noDataFound: "No videos available",
		  noDataFoundMessage: "There are currently no help videos registered in the system."
		},
		schedules: {
		  title: "Appointments",
		  searchPlaceholder: "Search schedules...",
		  loading: "Loading schedules...",
		  emptyState: {
			title: "No schedules found",
			description: "Create a new schedule or adjust search filters"
		  },
		  buttons: {
			add: "New Schedule",
			addShort: "New",
			edit: "Edit",
			delete: "Delete",
			save: "Save",
			create: "Create",
			cancel: "Cancel",
			close: "Close",
			filter: "Filter",
			calendarView: "Calendar View",
			listView: "List View",
			refresh: "Update",
			view: "View details",
			download: "Download attachment"
		  },
		  filters: {
			all: "All schedules",
			pending: "Pending",
			sent: "Sent",
			error: "With error",
			allConnections: "All connections",
			whatsappConnection: "Filter by connection"
		  },
		  tabs: {
			today: "Today",
			pending: "Pending",
			sent: "Sent"
		  },
		  stats: {
			total: "Total schedules",
			pending: "Pending",
			sent: "Sent",
			error: "With error"
		  },
		  status: {
			sent: "Sent",
			pending: "Pending",
			error: "Error",
			processing: "Processing",
			cancelled: "Cancelled",
			unknown: "Unknown"
		  },
		  form: {
			titleAdd: "New Schedule",
			titleEdit: "Edit Schedule",
			contactSection: "Contact",
			messageSection: "Message",
			messagePlaceholder: "Enter the message to be sent...",
			scheduleSection: "Scheduling",
			recurrenceSection: "Recurrence",
			whatsappSection: "Connection to be used",
			selectWhatsapp: "Select the connection",
			sendAt: "Date and time of sending",
			sendAtHelp: "The message will be sent automatically on this date and time",
			enableRecurrence: "Enable recurrence",
			recurrencePattern: "Recurrence pattern",
			recurrenceEndDate: "End date of recurrence",
			recurrenceHelp: "Messages will be sent repeatedly until the end date",
			attachment: "Attachment",
			attachmentHelp: "Maximum size: 5MB",
			insertEmoji: "Insert emoji",
			uploadImage: "Send image"
		  },
		  recurrence: {
			none: "No recurrence",
			daily: "Daily",
			weekly: "Weekly",
			biweekly: "Every two weeks",
			monthly: "Monthly",
			quarterly: "Quarterly",
			semiannually: "Semi-annually",
			yearly: "Annually"
		  },
		  scheduleDetails: {
			title: "Schedule Details",
			contactInfo: "Contact Information",
			details: "Details",
			message: "Message",
			attachment: "Attachment",
			createdAt: "Created at",
			sendAt: "Scheduled for",
			sentAt: "Sent on",
			recurrence: {
			  title: "Recurrence",
			  none: "No recurrence",
			  daily: "Daily",
			  weekly: "Weekly",
			  biweekly: "Every two weeks",
			  monthly: "Monthly",
			  quarterly: "Quarterly",
			  semiannually: "Semi-annually",
			  yearly: "Annually"
			},
			recurrenceEnd: "End of recurrence",
			createdBy: "Created by",
			errorTitle: "Error in sending",
			whatsappConnection: "Connection to be used",
			errorMessage: "An error occurred while trying to send this message",
			downloadError: "Error downloading attachment",
			buttons: {
			  close: "Close",
			  edit: "Edit",
			  delete: "Delete",
			  download: "Download"
			},
			contact: "Contact",
			status: {
			  sent: "Sent",
			  pending: "Pending",
			  error: "Error",
			  processing: "Processing",
			  cancelled: "Cancelled",
			  unknown: "Unknown"
			}
		  },
		  selectContact: "Select a contact",
		  loadingContacts: "Loading contacts...",
		  noContactsFound: "No contact found",
		  contactSelectError: "Error loading contacts",
		  validation: {
			bodyRequired: "Message is required",
			bodyMinLength: "Message must have at least 5 characters",
			contactRequired: "A contact must be selected",
			sendAtRequired: "Sending date is mandatory",
			futureDateRequired: "The sending date must be in the future",
			patternRequired: "Recurrence pattern is mandatory",
			endDateRequired: "End date of recurrence is mandatory",
			endDateAfterSendAt: "End date must be after the sending date"
		  },
		  toasts: {
			created: "Schedule created successfully",
			updated: "Schedule updated successfully",
			deleted: "Schedule deleted successfully",
			attachmentDeleted: "Attachment removed successfully",
			loadError: "Error loading schedules",
			saveError: "Error saving schedule",
			deleteError: "Error deleting schedule",
			attachmentError: "Error sending attachment",
			attachmentDeleteError: "Error deleting attachment",
			contactLoadError: "Error loading contacts",
			fileSizeError: "The file must be a maximum of 5MB"
		  },
		  calendar: {
			date: "Date",
			time: "Time",
			event: "Event",
			allDay: "All day",
			week: "Week",
			work_week: "Work week",
			day: "Day",
			month: "Month",
			previous: "Previous",
			next: "Next",
			yesterday: "Yesterday",
			tomorrow: "Tomorrow",
			today: "Today",
			agenda: "Schedule",
			noEventsInRange: "There are no appointments in this period"
		  },
		  confirmationModal: {
			deleteTitle: "Delete Appointment",
			deleteMessage: "Are you sure you want to delete this appointment? This action cannot be undone."
		  },
		  attachment: "Attachment",
		  unknownContact: "Unknown Contact"
		},
		validation: {
		  required: "This field is required",
		  invalidTime: "Invalid time format",
		  endBeforeStart: "End time cannot be before start time",
		  lunchOutsideWork: "Lunch time must be within working hours",
		  lunchEndBeforeStart: "End of lunch cannot be before start of lunch",
		  completeLunchTime: "Fill in both lunch times or leave both blank"
		},
		contactPicker: {
		  label: "Select Contact",
		  typeMore: "Enter at least 2 characters to search",
		  noOptions: "No contact found",
		  loading: "Loading...",
		  noResultsFound: "No results found for this search",
		  errorFetching: "Error while searching for contacts",
		  errorFetchingInitial: "Error loading initial contact"
		},
		subscriptionBanner: {
		  message: "Your trial period ends in {{days}} days and {{hours}} hours. Subscribe now to avoid service interruptions!",
		  subscribe: "Subscribe Now"
		},
		common: {
		  create: "Save",
		  close: "Close",
		  edit: "Edit",
		  save: "Save",
		  delete: "Delete",
		  cancel: "Cancel",
		  apply: "Filter",
		  clear: "Clear",
		  rowsPerPage: "Results per page(s):",
		  displayedRows: "Page(s):"
		},
		serviceHours: {
		  collapse: "Collapse",
		  expand: "Expand",
		  workingHours: "Business Hours",
		  workTime: "Working Hours",
		  startTime: "Start Time",
		  endTime: "End Time",
		  lunchTime: "Lunch Time",
		  startLunchTime: "Start of Lunch",
		  endLunchTime: "End of Lunch",
		  formAriaLabel: "Business Hours Form",
		  successMessage: "Hours updated successfully!",
		  defaultError: "Error saving hours. Check the data provided.",
		  optional: "Optional",
		  optionalField: "Optional field",
		  validation: {
			required: "Required field",
			invalidTime: "Invalid time format (use HH:MM)",
			endBeforeStart: "End time cannot be before start time",
			lunchOutsideWork: "Lunch time must be within working hours",
			lunchEndBeforeStart: "End of lunch cannot be before the beginning",
			completeLunchTime: "Fill in both lunch times or leave blank"
		  },
		  daysweek: {
			day1: "Monday",
			day2: "Tuesday",
			day3: "Wednesday",
			day4: "Thursday",
			day5: "Friday",
			day6: "Saturday",
			day7: "Sunday"
		  }
		},
		tags: {
		  title: "Tags",
		  searchPlaceholder: "Search tags...",
		  noDataFound: "Oops, nothing here!",
		  noDataFoundMessage: "No tags found. Don't worry, you can create the first one! Click the button below to start.",
		  buttons: {
			add: "New Tag",
			edit: "Edit Tag",
			delete: "Delete Tag",
			deleteSelected: "Delete Selected",
			addToKanban: "Add to Kanban",
			removeFromKanban: "Remove from Kanban",
			selectAll: "Select All",
			unselectAll: "Deselect All",
			bulkActions: "Bulk Actions",
			export: "Export",
			cancel: "Cancel",
			create: "Create",
			update: "Update"
		  },
		  toasts: {
			updated: "Tag updated"
		  },
		  table: {
			id: "ID",
			name: "Name",
			color: "Color",
			tickets: "Tickets",
			kanban: "Kanban",
			actions: "Actions",
			msgRecurrent: "Recurring Message",
			recurrentTime: "Recurring Time",
			actCamp: "Active Campaign",
			rptDays: "Days to Repeat"
		  },
		  tooltips: {
			edit: "Edit tag",
			delete: "Delete tag",
			addToKanban: "Add to Kanban board",
			removeFromKanban: "Remove from Kanban board",
			bulkActions: "Bulk Actions",
			search: "Search tags"
		  },
		  modal: {
			title: {
			  add: "New Tag",
			  edit: "Edit Tag"
			},
			buttons: {
			  create: "Save Tag",
			  update: "Update Tag",
			  cancel: "Cancel"
			},
			form: {
			  name: {
				label: "Name",
				error: {
				  required: "Name is required",
				  min: "Name is too short"
				}
			  },
			  color: {
				label: "Color",
				error: {
				  required: "Color is required"
				}
			  },
			  kanban: {
				label: "Kanban"
			  }
			}
		  },
		  confirmationModal: {
			deleteTitle: "Delete Tag",
			deleteMessage: "Are you sure you want to delete this tag?",
			deleteSelectedTitle: "Delete Selected Tags",
			deleteSelectedMessage: "Are you sure you want to delete the selected tags?",
			kanbanTitle: "Update Kanban",
			kanbanMessage: "Do you want to update the Kanban status of the selected tags?",
			confirmationMessage: "This action cannot be undone. Do you want to continue?",
			confirmButton: "Confirm",
			cancelButton: "Cancel"
		  },
		  messages: {
			success: {
			  create: "Tag created successfully",
			  update: "Tag updated successfully",
			  delete: "Tag(s) deleted successfully",
			  kanban: "Kanban status updated successfully"
			},
			error: {
			  create: "Error creating tag",
			  update: "Error updating tag",
			  delete: "Error deleting tag(s)",
			  kanban: "Error updating Kanban status"
			}
		  },
		  help: {
			title: "Help",
			content: "On this screen you can\n1. Create or edit a tag\n2. Set a name for identification\n3. Choose a custom color\n4. Enable/disable Kanban mode to use the tag on the Kanban board.\nTips\n- The name must have at least 3 characters\n- The color will be used as the tag's background\n- Kanban mode allows the tag to appear on the visual management board"
		  },
		  filters: {
			allTags: "All Tags",
			onlyKanban: "Kanban Only",
			onlyNonKanban: "Non-Kanban Only"
		  },
		  bulk: {
			title: "Create Bulk Tags",
			patterns: {
			  tag: "Tag_1, Tag_2, Tag_3...",
			  ticket: "Ticket_1, Ticket_2, Ticket_3...",
			  priority: "Priority_1, Priority_2, Priority_3...",
			  status: "Status_1, Status_2, Status_3...",
			  department: "Dept_1, Dept_2, Dept_3...",
			  day: "Day_1, Day_2, Day_3..."
			},
			validation: {
			  quantity: {
				min: "Minimum quantity is 1",
				max: "Maximum quantity is 100",
				required: "Quantity is required"
			  },
			  pattern: {
				required: "Name pattern is required"
			  }
			},
			form: {
			  quantity: "Quantity of Tags",
			  pattern: "Name Pattern",
			  kanban: "Kanban"
			},
			buttons: {
			  cancel: "Cancel",
			  create: "Create"
			},
			help: "On this screen you can\n1. Create multiple tags at once\n2. Set the quantity of tags (1-100)\n3. Choose a pattern for the names\n4. Enable/disable Kanban mode for all tags"
		  }
		},
		settings: {
		  loading: "Loading settings...",
		  loadError: "Error loading settings",
		  title: "Settings",
		  tabs: {
			general: "General",
			messaging: "Messages",
			notifications: "Notifications",
			security: "Security",
			chatbot: "Chatbot",
			integrations: "Integrations",
			company: "Company",
			admin: "Admin",
			companies: "Companies",
			plans: "Plans",
			helps: "Help",
			params: "Parameters",
			schedules: "Timings"
		  },
		  general: {
			title: "General Settings",
			subtitle: "Manage basic system settings",
			tickets: {
			  title: "Tickets",
			  oneTicketPerConnection: "One ticket per connection",
			  oneTicketPerConnectionHelper: "Limits ticket creation to one per connection",
			  showValueAndSku: "Display value and SKU",
			  showValueAndSkuHelper: "Shows value and SKU information on tickets"
			},
			schedule: {
			  title: "Scheduling",
			  disabled: "Disabled",
			  company: "By company",
			  queue: "By department",
			  helper: "Defines how message scheduling will work"
			},
			rating: {
			  title: "Rating",
			  enable: "Enable evaluation",
			  helper: "Allows users to evaluate the service"
			},
			contact: {
			  title: "Contact",
			  showNumber: "Display contact number",
			  showNumberHelper: "Shows the contact number in ticket information"
			}
		  },
		  messaging: {
			title: "Message Settings",
			subtitle: "Manage how messages are handled in the system",
			quickResponses: {
			  title: "Quick Replies",
			  byCompany: "By company",
			  byUser: "Por usuário",
			  helper: "Defines how quick responses are organized"
			},
			greetings: {
			  title: "Greetings",
			  sendOnAccept: "Send when accepting ticket",
			  sendOnAcceptHelper: "Sends automatic message when a ticket is accepted",
			  sendOnSingleQueue: "Send in single department",
			  sendOnSingleQueueHelper: "Sends automatic message when there is only one department"
			},
			groups: {
			  title: "Groups",
			  ignoreGroups: "Ignore group messages",
			  ignoreGroupsHelper: "Does not create tickets for group messages"
			},
			transfer: {
			  title: "Transfer",
			  notifyOnTransfer: "Notify transfer",
			  notifyOnTransferHelper: "Notifies users when a ticket is transferred"
			},
			ai: {
			  title: "Artificial Intelligence",
			  alert: "AI features may be subject to additional charges",
			  summarize: "Summarize conversations",
			  summarizeHelper: "Generate automatic summaries of conversations using AI"
			}
		  },
		  notifications: {
			title: "Notification Settings",
			subtitle: "Manage how notifications are sent",
			register: {
			  title: "Registration",
			  sendEmail: "Send email on registration",
			  sendEmailHelper: "Sends welcome email to new users",
			  sendMessage: "Send message on registration",
			  sendMessageHelper: "Sends welcome message to new users"
			},
			email: {
			  title: "Email",
			  smtpServer: "SMTP Server",
			  smtpServerHelper: "SMTP server address",
			  smtpPort: "SMTP Port",
			  smtpPortHelper: "SMTP server port",
			  smtpUser: "SMTP User",
			  smtpUserHelper: "User for SMTP authentication",
			  smtpPassword: "SMTP Password",
			  smtpPasswordHelper: "Password for SMTP authentication",
			  testSuccess: "SMTP test successful",
			  testTooltip: "Test SMTP settings",
			  smtpRequired: "SMTP settings are required for sending emails",
			  smtpInfo: "Learn more about SMTP settings"
			},
			ticket: {
			  title: "Tickets",
			  notifyTransfer: "Notify transfer",
			  notifyTransferHelper: "Notify when a ticket is transferred",
			  requireReason: "Require reason when closing",
			  requireReasonHelper: "Requests reason when a ticket is closed"
			}
		  },
		  security: {
			title: "Security Settings",
			subtitle: "Manage system security settings",
			access: {
			  title: "Access",
			  allowSignup: "Allow registration",
			  allowSignupHelper: "Allows new users to register"
			},
			apiToken: {
			  title: "API Token",
			  label: "API access token",
			  warning: "Keep this token secure",
			  helper: "Token for API integration",
			  generated: "New token generated successfully",
			  deleted: "Token removed successfully",
			  copied: "Token copied to clipboard",
			  error: "Error managing token",
			  info: "Use this token to authenticate requests to the API"
			},
			limits: {
			  title: "Limits",
			  downloadLimit: "Download limit",
			  downloadLimitHelper: "Maximum size for file downloads"
			}
		  },
		  chatbot: {
			title: "Chatbot Settings",
			subtitle: "Manage chatbot settings",
			general: {
			  title: "General",
			  show: "Show chatbot in the main menu",
			  showHelper: "Exibe o chatbot no menu principal"
			},
			types: {
			  text: "Text",
			  button: "Button",
			  list: "List",
			  helper: "Set the chatbot interface type"
			},
			ai: {
			  title: "Artificial Intelligence",
			  info: "Configure the chatbot's AI resources",
			  modelHelper: "Choose the AI model to be used",
			  summarize: "Summarize conversations",
			  summarizeHelper: "Generates conversation summaries automatically"
			},
			webhook: {
			  title: "Webhook",
			  url: "Webhook URL",
			  urlHelper: "Address for sending events",
			  test: "Test Webhook",
			  testSuccess: "Test successful",
			  testError: "Error testing webhook",
			  required: "Webhook URL is mandatory",
			  invalid: "Invalid URL",
			  enableN8N: "Enable N8N",
			  enableN8NHelper: "Integrate with the N8N platform"
			}
		  },
		  integrations: {
			title: "Integrations",
			subtitle: "Manage system integrations",
			warning: "Configure integrations carefully",
			enable: "Enable",
			save: "Save",
			glpi: {
			  title: "GLPI",
			  url: "API URL",
			  appToken: "Application Token",
			  masterToken: "Master Token",
			  testSuccess: "Test successful",
			  testError: "Error testing connection",
			  validationError: "Fill in all required fields",
			  saved: "Settings saved successfully",
			  error: "Error saving settings"
			},
			ixc: {
			  title: "IXC",
			  serverIp: "Server IP",
			  token: "Access Token",
			  saved: "Settings saved successfully",
			  error: "Error saving settings"
			},
			mkauth: {
			  title: "MK-AUTH",
			  serverIp: "Server IP",
			  clientId: "Client ID",
			  clientSecret: "Secret Key",
			  saved: "Settings saved successfully",
			  error: "Error saving settings"
			},
			asaas: {
			  title: "Asaas",
			  apiKey: "API Key",
			  saved: "Settings saved successfully",
			  error: "Error saving settings"
			}
		  },
		  company: {
			title: "Company Settings",
			subtitle: "Manage your company settings",
			branding: {
			  title: "Visual Identity",
			  logo: "Logo",
			  background: "Background",
			  upload: "Send file",
			  logoHelper: "Company logo (max. 1MB)",
			  backgroundHelper: "Background image (max. 2MB)"
			},
			omie: {
			  title: "Omie",
			  enable: "Enable Omie",
			  enableHelper: "Integrate with Omie platform",
			  appKey: "Application Key",
			  appSecret: "Secret Key",
			  info: "Set up integration with Omie",
			  sync: "Sync",
			  syncSuccess: "Sync successful",
			  syncError: "Sync error"
			}
		  },
		  admin: {
			title: "Administrator Settings",
			subtitle: "Manage administrative settings",
			warning: "These settings affect the entire system",
			unauthorized: {
			  title: "Unauthorized Access",
			  message: "You do not have permission to access these settings"
			},
			trial: {
			  title: "Trial Period",
			  days: "days",
			  helper: "Set the duration of the trial period",
			  warning: "Changing this value affects new records"
			},
			connections: {
			  title: "Connections",
			  enableAll: "Enable all connections",
			  enableAllHelper: "Allows all connections in the system"
			},
			support: {
			  title: "Support",
			  enable: "Enable support",
			  enableHelper: "Activates the support system",
			  phone: "Support phone",
			  message: "Support message",
			  test: "Test support",
			  testSuccess: "Test successful",
			  testError: "Error testing support"
			},
			advanced: {
			  title: "Advanced",
			  warning: "Change these settings with caution",
			  allowSignup: "Allow registrations",
			  allowSignupHelper: "Allows new registrations in the system"
			}
		  },
		  validation: {
			error: "Validation error"
		  },
		  updateSuccess: "Configuration updated successfully",
		  updateError: "Error updating configuration",
		  genericError: "An error occurred while processing the request"
		},
		messagesList: {
		  header: {
			assignedTo: "Assigned to:",
			dialogRatingTitle: "Do you want to leave a customer service review?",
			dialogClosingTitle: "Ending the service!",
			dialogRatingCancel: "Resolve with Closing Message",
			dialogRatingSuccess: "Resolve and Send Review",
			dialogRatingWithoutFarewellMsg: "Resolve without Closing Message",
			ratingTitle: "Choose a review menu",
			buttons: {
			  return: "Return",
			  resolve: "Resolve",
			  reopen: "Reopen",
			  accept: "Accept",
			  rating: "Send Evaluation"
			}
		  },
		  confirm: {
			resolveWithMessage: "Send completion message?",
			yes: "Yes",
			no: "No"
		  }
		},
		messagesInput: {
		  recording: {
			tooltip: "Record audio"
		  },
		  attach: "Attach file(s)",
		  placeholderOpen: "Type a message",
		  placeholderClosed: "Reopen or accept this ticket to send a message.",
		  signMessage: "Sign",
		  invalidFileType: "Invalid file type."
		},
		message: {
		  edited: "Edited",
		  deleted: "Message deleted by Contact"
		},
		contactDrawer: {
		  header: "Contact's data",
		  buttons: {
			edit: "Edit contact"
		  },
		  extraInfo: "Other information"
		},
		fileModal: {
		  title: {
			add: "Add file list",
			edit: "Edit file list"
		  },
		  buttons: {
			okAdd: "Save",
			okEdit: "Edit",
			cancel: "Cancel",
			fileOptions: "Add file"
		  },
		  form: {
			name: "File list name",
			message: "List details",
			fileOptions: "File List",
			extraName: "Message to send with file",
			extraValue: "Option value"
		  },
		  success: "File list saved successfully!"
		},
		ticketOptionsMenu: {
		  schedule: "Scheduling",
		  delete: "Delete",
		  transfer: "Transfer",
		  registerAppointment: "Contact's notes",
		  resolveWithNoFarewell: "Finish Without Closing Message",
		  acceptAudioMessage: "Allow Audio?",
		  appointmentsModal: {
			title: "Contact's notes",
			textarea: "Note",
			placeholder: "Enter the information you want to record here"
		  },
		  confirmationModal: {
			title: "Delete contact's ticket",
			titleFrom: "Do you really want to delete the contact's ticket?",
			message: "Attention! All messages related to the ticket will be lost."
		  },
		  buttons: {
			delete: "Delete",
			cancel: "Cancel"
		  }
		},
		confirmationModal: {
		  buttons: {
			confirm: "Ok",
			cancel: "Cancel"
		  }
		},
		messageOptionsMenu: {
		  delete: "Delete",
		  reply: "Reply",
		  history: "History",
		  edit: "Edit",
		  react: "React",
		  confirmationModal: {
			title: "Delete message?",
			message: "This action cannot be undone."
		  },
		  forward: "Select to forward",
		  forwardbutton: "FORWARD",
		  forwardmsg1: "Forward message",
		  reactions: {
			like: "Like",
			love: "Love",
			haha: "Haha"
		  },
		  reactionSuccess: "Reaction added successfully!"
		},
		forwardModal: {
		  title: "Forward message",
		  fieldLabel: "Select or type a contact",
		  buttons: {
			cancel: "Cancel",
			forward: "Forward"
		  }
		},
		inputErrors: {
		  tooShort: "Too short",
		  tooLong: "Too long",
		  required: "Required",
		  email: "Invalid email address"
		},
		presence: {
		  unavailable: "Unavailable",
		  available: "Available",
		  composing: "Typing...",
		  recording: "Recording...",
		  paused: "Paused"
		},
		efi: {
		  efiSettings: "EFI Settings",
		  certificate: "Certificate",
		  clientId: "Client ID",
		  clientSecret: "Client Secret",
		  pixKey: "PIX Key",
		  efiApiConfigInstructions: "Instructions to set up the EFI API",
		  fileUploadSuccess: "File uploaded successfully",
		  fileUploadError: "Error sending the file",
		  settingUpdateSuccess: "Configuration updated successfully",
		  efiInstructions: [
			"Access the EFI account",
			"Create a random PIX Key, which will be informed in the payment system settings",
			"On the left menu, click on \"API\" and then on \"Create Application\"",
			"Name the application (it can be any name, just to identify the integration) and click continue",
			"On the screen to select scopes, click on Pix API to expand, select \"Send PIX\" and select all items, both Production and Testing",
			"Next, the Client ID and Secret Key will be generated, which must be informed in the settings, in payments of your system.",
			"Still on the API screen, select \"My Certificates\" on the left menu and click on \"Create new certificate\"",
			"Provide a name to identify the certificate and click on \"Create Certificate\"",
			"Click on download certificate, this certificate will also be used in the configuration of your system."
		  ].join("\n")
		},
		assistants: {
			title: "AI Agents",
			searchPlaceholder: "Search agents...",
			emptyState: {
			  title: "No agents found",
			  description: "Create your first agent to start using AI in your customer service."
			},
			status: {
			  active: "Active",
			  inactive: "Inactive"
			},
			labels: {
			  model: "Model",
			  tools: "Tools",
			  noTools: "No tools configured",
			  none: "None"
			},
			tools: {
			  availableTools: "Available Tools",
			  fileSearch: "Files",
			  codeInterpreter: "Code",
			  function: "Functions",
			  fileSearchFull: "File Search",
			  codeInterpreterFull: "Code Interpreter",
			  functionFull: "Custom Functions",
			  fileSearchDescription: "Allows the assistant to search and use information contained in files.",
			  codeInterpreterDescription: "Allows the assistant to execute Python code for data analysis and chart generation.",
			  functionDescription: "Allows the assistant to call custom functions for integration with external systems.",
			  fileSearchConfig: "Configure files in the \"Files\" tab.",
			  codeInterpreterConfig: "Configure files in the \"Files\" tab.",
			  functionConfig: "Configure functions in the \"Functions\" tab."
			},
			functions: {
			  enableFirst: "Enable the \"Custom Functions\" tool in the \"Tools\" tab to configure functions."
			},
			tabs: {
			  basicSettings: "Basic Settings",
			  tools: "Tools",
			  files: "Files",
			  functions: "Functions"
			},
			table: {
			  name: "Name",
			  model: "Model",
			  tools: "Tools",
			  status: "Status",
			  actions: "Actions"
			},
			form: {
			  openaiApiKey: "OpenAI API Key",
			  name: "Agent Name",
			  instructions: "Instructions",
			  model: "Model",
			  active: "Active",
			  activeHelp: "When inactive, the agent will not respond automatically",
			  toolType: "Tool Type",
			  toolTypeHelp: "Select which tool the files will be sent to",
			  addFiles: "Add Files",
			  newFiles: "New Files",
			  existingFiles: "Existing Files",
			  noFiles: "No files found"
			},
			filters: {
			  allTools: "All",
			  allModels: "All",
			  modelLabel: "Model",
			  toolLabel: "Tool"
			},
			buttons: {
			  add: "Add",
			  addEmpty: "ADD AGENT",
			  import: "Import",
			  help: "Help",
			  edit: "Edit",
			  delete: "Delete",
			  search: "Search",
			  cancelSelection: "Cancel selection",
			  deleteSelected: "Delete selected",
			  cancel: "Cancel",
			  okEdit: "Save Changes",
			  okAdd: "Add Agent"
			},
			modal: {
			  title: {
				add: "Add Agent",
				edit: "Edit Agent"
			  }
			},
			confirmationModal: {
			  deleteTitle: "Delete agent",
			  deleteMessage: "This action cannot be undone. All data associated with this agent will be permanently removed."
			},
			pagination: {
			  showing: "Showing {visible} of {total} agents",
			  previous: "Previous",
			  next: "Next"
			},
			validation: {
			  required: "Required",
			  tooShort: "Too short!",
			  tooLong: "Too long!"
			},
			toasts: {
			  success: "Agent saved successfully",
			  deleted: "Agent deleted successfully",
			  deleteError: "Error deleting agent",
			  loadError: "Error loading agents",
			  loadAssistantError: "Error loading agent data",
			  loadFilesError: "Error loading agent files",
			  saveError: "Error saving agent",
			  fileRemoved: "File removed successfully",
			  fileRemoveError: "Error removing file",
			  fileSizeExceeded: "Total file size exceeds the 2048KB limit"
			},
			help: {
			  title: "AI Agents Help",
			  common: {
				capabilities: "Capabilities",
				supportedFormats: "Supported formats",
				field: "Field",
				description: "Description"
			  },
			  tabs: {
				introduction: "Introduction",
				creation: "Creation",
				tools: "Tools",
				import: "Import",
				messageTypes: "Message Types"
			  },
			  introduction: {
				description: "AI Agents are virtual assistants based on Artificial Intelligence that can automatically serve your customers.",
				whatAre: {
				  title: "What are AI Agents?",
				  description: "AI Agents use advanced language models to provide automated service, but with natural and personalized responses for your customers.",
				  benefits: {
					personalization: "Complete personalization of responses and behavior",
					contextMemory: "Context memory to maintain coherent conversations",
					tools: "Use of advanced tools such as file search and data analysis",
					integration: "Seamless integration with the existing service flow"
				  }
				},
				page: {
				  title: "The Agents page",
				  description: "This page allows you to manage all your AI Agents, from creation to monitoring and editing.",
				  sections: {
					creation: "Agent Creation",
					creationDesc: "Create new custom assistants for specific business needs.",
					import: "Import",
					importDesc: "Import agents already configured in your OpenAI account to use here.",
					search: "Search and Filters",
					searchDesc: "Quickly find agents with filters by model and tools.",
					management: "Management",
					managementDesc: "Edit, delete or deactivate agents as needed."
				  }
				},
				models: {
				  title: "Available Models",
				  description: "Choose between different AI models, each with specific performance, quality, and cost characteristics:",
				  gpt4: "The most advanced model, with greater capacity for understanding and complex reasoning.",
				  gpt4turbo: "Optimized version of GPT-4, offering a good balance between quality and speed.",
				  gpt35: "Fast and economical model, ideal for simple and high volume tasks.",
				  capabilities: {
					contextual: "Advanced context understanding",
					reasoning: "Complex reasoning",
					code: "High quality code generation",
					analysis: "Sophisticated data analysis",
					speed: "Optimized speed",
					knowledge: "More recent knowledge",
					costBenefit: "Good cost-benefit ratio",
					versatile: "Ideal for most use cases",
					maxSpeed: "Maximum speed",
					lowCost: "Reduced cost",
					simpleTasks: "Ideal for simple tasks",
					highScale: "Perfect for high scale"
				  },
				  tip: {
					title: "Tip for model selection",
					description: "For most cases, GPT-4 Turbo offers the best balance between quality and cost. Use GPT-4 for cases that require more sophisticated reasoning and GPT-3.5 for simple tasks in large volume."
				  }
				}
			  },
			  creation: {
				title: "Creating an Agent",
				description: "The process of creating an agent involves a few simple but important steps for the proper functioning of the assistant.",
				stepsTitle: "Creation steps",
				steps: {
				  one: {
					title: "Start the process",
					description: "Click the 'Add' button at the top of the Agents page to open the creation form."
				  },
				  two: {
					title: "Basic settings",
					description: "Fill in the essential information for the agent's operation:",
					fields: {
					  apiKey: "OpenAI API Key",
					  apiKeyDesc: "Your personal OpenAI API key for service authentication.",
					  name: "Name",
					  nameDesc: "An identifying name for the agent, visible only to you.",
					  instructions: "Instructions",
					  instructionsDesc: "Detailed guidelines that define the agent's behavior, tone, and knowledge.",
					  model: "Model",
					  modelDesc: "The AI model to be used, which defines the agent's capabilities and costs."
					}
				  },
				  three: {
					title: "Enable tools",
					description: "Choose the tools you want to make available to your agent:",
					tools: {
					  fileSearch: "File Search",
					  codeInterpreter: "Code Interpreter",
					  functions: "Custom Functions"
					},
					note: "Each tool adds specific capabilities and may require additional configuration."
				  },
				  four: {
					title: "Save the agent",
					description: "Click 'Add Agent' to finalize the creation. The agent will be available immediately for use."
				  }
				},
				tips: {
				  title: "Tips for creating effective agents",
				  instructionsQuality: "Provide detailed and clear instructions to get more accurate responses in the desired tone.",
				  specificPurpose: "Create agents with specific purposes rather than a single generic agent for all tasks.",
				  testIteratively: "Test the agent's behavior regularly and adjust instructions as needed."
				}
			  },
			  tools: {
				title: "Available Tools",
				description: "Agents can use special tools that extend their capabilities beyond simple text conversation.",
				fileSearch: {
				  title: "File Search",
				  description: "Allows the agent to search for information in uploaded documents to answer questions based on their content.",
				  capabilities: {
					retrieveInfo: "Retrieves specific information from documents",
					answerQuestions: "Answers questions based on file content",
					summarize: "Creates summaries and syntheses of extensive documents"
				  }
				},
				codeInterpreter: {
				  title: "Code Interpreter",
				  description: "Allows the agent to execute Python code for data analysis, calculations, and visualization generation.",
				  capabilities: {
					executeCode: "Executes Python code for data analysis",
					dataAnalysis: "Performs statistical and mathematical analyses",
					visualizations: "Generates charts and data visualizations"
				  }
				},
				functions: {
				  title: "Custom Functions",
				  description: "Allows the agent to perform specific actions through defined functions, such as integration with external systems.",
				  capabilities: {
					integration: "Integration with external systems and APIs",
					realTime: "Access to real-time data",
					actions: "Execution of specific business actions"
				  }
				},
				configuration: {
				  title: "Tool Configuration",
				  description: "Each tool requires specific configurations for proper operation:",
				  fileSearch: {
					title: "Configuring File Search",
					step1: "Enable the 'File Search' tool in the Tools tab.",
					step2: "Go to the 'Files' tab and select 'File Search' in the tool type.",
					step3: "Add the files you want to make available for the agent to query."
				  },
				  codeInterpreter: {
					title: "Configuring Code Interpreter",
					step1: "Enable the 'Code Interpreter' tool in the Tools tab.",
					step2: "Go to the 'Files' tab and select 'Code Interpreter' in the tool type.",
					libraries: "The Python environment includes popular libraries such as pandas, numpy, matplotlib, and scikit-learn by default."
				  },
				  functions: {
					title: "Configuring Custom Functions",
					step1: "Enable the 'Custom Functions' tool in the Tools tab.",
					step2: "Go to the 'Functions' tab and add the functions you want to make available to the agent.",
					parameters: {
					  title: "Parameter Configuration",
					  name: "Name",
					  nameDesc: "Function name that the agent will call",
					  description: "Description",
					  descriptionDesc: "Explanation of what the function does and when it should be used",
					  type: "Type",
					  typeDesc: "Parameter data type (string, number, boolean, etc)",
					  required: "Required",
					  requiredDesc: "Indicates whether the parameter is required or optional"
					}
				  }
				},
				limitations: {
				  title: "Limitations",
				  description: "The tools have some important limitations to consider: the Code Interpreter operates in an isolated environment without internet access, File Search supports a limited number of formats, and Custom Functions require additional configuration for effective implementation."
				}
			  },
			  import: {
				title: "Importing Agents",
				description: "You can import existing agents from your OpenAI account to use in the system.",
				processTitle: "Import Process",
				steps: {
				  one: {
					title: "Start import",
					description: "Click the 'Import' button at the top of the Agents page to open the import wizard.",
					note: "You will need your OpenAI API key to complete this process."
				  },
				  two: {
					title: "Select agents",
					description: "The system will show all available agents in your OpenAI account. Select the ones you want to import."
				  },
				  three: {
					title: "Complete import",
					description: "Click 'Import Selected' to finalize the process. The imported agents will appear in your list.",
					note: "Some elements such as files and specific functions may need to be reconfigured after import."
				  }
				},
				advantages: {
				  title: "Import Advantages",
				  time: "Saves time by reusing agents already configured in OpenAI",
				  consistency: "Maintains consistency between agents used on the OpenAI platform and in the system",
				  migration: "Facilitates gradual migration to our integrated system"
				},
				limitations: {
				  title: "Import Limitations",
				  description: "There are some important limitations to consider in the import process:",
				  files: {
					title: "Files",
					description: "Files associated with agents in OpenAI are not automatically imported and need to be added again."
				  },
				  keys: {
					title: "API Keys",
					description: "You will need to provide your API key again for each agent, even if they all use the same key."
				  },
				  functions: {
					title: "Functions",
					description: "Custom functions will need to be manually reconfigured after import."
				  }
				},
				security: {
				  title: "Security",
				  description: "Your OpenAI API key is used only for the import process and interaction with the agents. It is stored securely and encrypted in our system."
				}
			  },
			  messageTypes: {
				title: "Supported Message Types",
				description: "The agent can send various types of messages beyond simple text. See below for supported formats and how to use them.",
				text: {
				  title: "Text Message",
				  description: "Simple text messages are sent automatically. The agent can respond with paragraphs, lists, and basic formatting.",
				  example: "Example:",
				  exampleText: "Hello! How can I help you today?"
				},
				location: {
				  title: "Location (Map)",
				  description: "Send geographic coordinates to show a location on the map.",
				  example: "Format:"
				},
				document: {
				  title: "Documents",
				  description: "Send documents such as PDF, DOC, XLS, and other file formats.",
				  example: "Format:"
				},
				video: {
				  title: "Videos",
				  description: "Share videos from external URLs.",
				  example: "Format:"
				},
				contact: {
				  title: "Contacts",
				  description: "Share contact information that can be saved to the user's address book.",
				  example: "Format:"
				},
				audio: {
				  title: "Audio",
				  description: "Send voice messages or audio from external URLs.",
				  example: "Format:"
				},
				image: {
				  title: "Images",
				  description: "Share images from external URLs or generated by the agent.",
				  example: "Format:"
				},
				tips: {
				  title: "Tips for using messages",
				  description: "To use these features, include special commands in your agent's instructions. Commands must be formatted exactly as shown in the examples above. Multiple commands can be combined in a single response."
				}
			  }
			}
		  },
		pagination: {
		  itemsPerPage: "{{count}} per page",
		  itemsPerPageTooltip: "Select the number of items to be displayed per page. This helps control the amount of information shown at once."
		},
		newapi: {
			title: "API Playground",
			helpButton: "Help",
			helpTooltip: "View detailed API documentation",
			selectRoute: "Select a route:",
			selectLanguage: "Language:",
			replaceToken: "Replace (YOUR_TOKEN_HERE) with your authentication token.",
			method: "Method",
			endpoint: "Endpoint",
			pathParamsInfo: "* Path parameters indicated between braces {param} will be replaced with corresponding values.",
			steps: {
			  selectRoute: "Select Route",
			  generateCode: "Generate Code",
			  testApi: "Test API"
			},
			tabs: {
			  select: "Select",
			  generate: "Generate Code",
			  test: "Test API"
			},
			languages: {
			  javascript: "JavaScript",
			  python: "Python",
			  php: "PHP"
			},
			buttons: {
			  send: "Send",
			  delete: "Delete",
			  close: "Close"
			},
			success: {
			  requestSuccessful: "Request completed successfully!"
			},
			errors: {
			  requestError: "Request error:",
			  processingError: "Error processing the request",
			  serverError: "Error",
			  noResponse: "Could not connect to server. Check your connection.",
			  unknownServerError: "Unknown server error"
			},
			warnings: {
			  noToken: "No authentication token detected. You need to have a WhatsApp connected or provide a token manually."
			},
			formValidation: {
			  required: "The {field} field is required",
			  invalidEmail: "Invalid email",
			  mustBeNumber: "Must be a number",
			  onlyNumbers: "Invalid format. Only numbers are allowed."
			},
			codeBlock: {
			  copied: "Code copied to clipboard!",
			  copyToClipboard: "Copy to clipboard"
			},
			help: {
			  title: "AutoAtende API Documentation",
			  introduction: "The AutoAtende API allows you to integrate messaging, tickets, contacts, and other functionalities into your applications. All requests require authentication via token in the Authorization header.",
			  authTitle: "Authentication",
			  authDescription: "All API requests must include an authentication token in the Authorization header, in the Bearer token format. You can obtain the token in the WhatsApp settings on the AutoAtende panel.",
			  authExample: "Example of how to include the token in the header:",
			  closeButton: "Close",
			  parametersTitle: "Parameters",
			  responsesTitle: "Responses",
			  exampleTitle: "Example",
			  required: "required",
			  noParameters: "This route doesn't require additional parameters.",
			  noResponsesSpecified: "No specific details about the responses for this route.",
			  categories: {
				messages: "Messages",
				tickets: "Tickets",
				contacts: "Contacts",
				companies: "Companies",
				invoices: "Invoices",
				dashboard: "Dashboard"
			  },
			  messagesDescription: "Endpoints for sending messages, files, and verifying numbers on WhatsApp.",
			  ticketsDescription: "Endpoints for ticket management (creation, update, closing, and listing).",
			  contactsDescription: "Endpoints for contact management (creation, update, deletion, and listing).",
			  companiesDescription: "Endpoints for company management (creation, update, and blocking).",
			  invoicesDescription: "Endpoints for querying invoices.",
			  dashboardDescription: "Endpoints for obtaining statistical data and system metrics.",
			  endpoints: {
				sendMessage: {
				  description: "Sends a text message to a WhatsApp number. May include media files.",
				  params: {
					number: "Recipient's number (including country code and area code, without special characters)",
					body: "Message content",
					medias: "Media files to send (optional)",
					queueId: "Queue ID to associate with the ticket",
					status: "Desired status for the ticket after sending (open, pending, or closed)"
				  },
				  responses: {
					200: "Message sent successfully",
					401: "Unauthorized - Invalid or missing token",
					500: "Server error"
				  },
				  exampleTitle: "Example of sending a message with a file:",
				  exampleComment: "To send a file, uncomment the lines below:"
				},
				sendPdfLink: {
				  description: "Sends a message with a link to a PDF file.",
				  params: {
					number: "Recipient's number (including country code and area code, without special characters)",
					url: "URL of the PDF to be sent",
					caption: "Caption to send with the link"
				  },
				  responses: {
					200: "PDF link sent successfully",
					401: "Unauthorized - Invalid or missing token",
					500: "Server error"
				  },
				  exampleTitle: "Example of sending a link to a PDF:"
				},
				sendImageLink: {
				  description: "Sends a message with a link to an image.",
				  params: {
					number: "Recipient's number (including country code and area code, without special characters)",
					url: "URL of the image to be sent",
					caption: "Caption to send with the image"
				  },
				  responses: {
					200: "Image link sent successfully",
					401: "Unauthorized - Invalid or missing token",
					500: "Server error"
				  }
				},
				checkNumber: {
				  description: "Checks if a number is valid and registered on WhatsApp.",
				  params: {
					number: "Number to check (including country code and area code, without special characters)"
				  },
				  responses: {
					200: "Number verified successfully",
					400: "Invalid number or not found on WhatsApp",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				internalMessage: {
				  description: "Creates an internal message in an existing ticket without sending to WhatsApp.",
				  params: {
					ticketId: "ID of the ticket where the message will be added",
					body: "Content of the internal message",
					medias: "Media files to attach (optional)"
				  },
				  responses: {
					200: "Internal message created successfully",
					401: "Unauthorized - Invalid or missing token",
					500: "Server error"
				  }
				},
				createTicket: {
				  description: "Creates a new ticket associated with a contact.",
				  params: {
					contactId: "ID of the contact to associate with the ticket",
					status: "Initial status of the ticket (open, pending, closed)",
					userId: "ID of the user responsible for the ticket (optional)",
					queueId: "ID of the queue to associate with the ticket (optional)",
					whatsappId: "ID of the WhatsApp to be used (optional)"
				  },
				  responses: {
					201: "Ticket created successfully",
					401: "Unauthorized - Invalid or missing token",
					500: "Server error"
				  }
				},
				closeTicket: {
				  description: "Changes a ticket's status to 'closed'.",
				  params: {
					ticketId: "ID of the ticket to be closed"
				  },
				  responses: {
					200: "Ticket closed successfully",
					401: "Unauthorized - Invalid or missing token",
					500: "Server error"
				  }
				},
				updateQueueTicket: {
				  description: "Updates the queue associated with a specific ticket.",
				  params: {
					ticketId: "ID of the ticket to be updated",
					queueId: "ID of the new queue for the ticket"
				  },
				  responses: {
					200: "Ticket queue updated successfully",
					400: "Invalid queue or doesn't belong to the company",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				addTagToTicket: {
				  description: "Associates a specific tag with a ticket.",
				  params: {
					ticketId: "ID of the ticket to be updated",
					tagId: "ID of the TAG to add to the ticket"
				  },
				  responses: {
					200: "TAG added to ticket successfully",
					400: "Invalid tag or already associated with the ticket",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				removeTagFromTicket: {
				  description: "Removes the association between a tag and a ticket.",
				  params: {
					ticketId: "ID of the ticket from which the tag will be removed",
					tagId: "ID of the tag to be removed"
				  },
				  responses: {
					200: "Tag removed from ticket successfully",
					400: "Tag is not associated with the ticket",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				listTickets: {
				  description: "Returns the list of tickets associated with the company of the token.",
				  params: {
					companyId: "Company ID (optional, will be obtained from the token if not provided)"
				  },
				  responses: {
					200: "Tickets listed successfully",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				listTicketsByTag: {
				  description: "Returns tickets that have a specific tag.",
				  params: {
					tagId: "ID of the tag to filter tickets"
				  },
				  responses: {
					200: "Tickets listed successfully",
					400: "Invalid tag or doesn't belong to the company",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				createPBXTicket: {
				  description: "Creates an internal ticket based on information from a phone call.",
				  params: {
					phoneNumber: "Contact's phone number",
					contactName: "Contact's name (used if the contact doesn't exist)",
					status: "Initial status of the ticket (open, pending, closed)",
					ramal: "Extension number that answered/originated the call",
					idFilaPBX: "Queue ID in the PBX system",
					message: "Internal message to add to the ticket",
					medias: "Media files to add to the ticket"
				  },
				  responses: {
					201: "PBX ticket created successfully",
					400: "Invalid or missing parameters",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				getTicketHistory: {
				  description: "Returns tickets with their messages within a date range.",
				  params: {
					startDate: "Start date (YYYY-MM-DD)",
					endDate: "End date (YYYY-MM-DD)",
					contactNumber: "Contact number to filter (optional)"
				  },
				  responses: {
					200: "Ticket history obtained successfully",
					400: "Invalid parameters",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				listContacts: {
				  description: "Returns the list of contacts associated with the company of the token.",
				  params: {
					companyId: "Company ID (optional, will be obtained from the token if not provided)"
				  },
				  responses: {
					200: "Contacts listed successfully",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				searchContacts: {
				  description: "Returns a paginated list of contacts with option to filter by search term.",
				  params: {
					searchParam: "Term to search in the contact's name or number",
					pageNumber: "Page number for pagination",
					companyId: "Company ID (optional, will be obtained from the token if not provided)"
				  },
				  responses: {
					200: "Contacts listed successfully",
					401: "Unauthorized - Invalid or missing token",
					500: "Server error"
				  }
				},
				createCompany: {
				  description: "Creates a new company with the provided data.",
				  params: {
					name: "Company name",
					email: "Company's main email",
					phone: "Company's contact phone",
					status: "Active/inactive status of the company"
				  },
				  responses: {
					200: "Company created successfully",
					400: "Validation error",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				updateCompany: {
				  description: "Updates the data of an existing company.",
				  params: {
					id: "ID of the company to be updated",
					name: "Company name",
					email: "Company's main email",
					phone: "Company's contact phone",
					status: "Active/inactive status of the company"
				  },
				  responses: {
					200: "Company updated successfully",
					400: "Validation error",
					401: "Unauthorized - Invalid or missing token",
					404: "Company not found"
				  }
				},
				blockCompany: {
				  description: "Sets a company's status as inactive (blocked).",
				  params: {
					companyId: "ID of the company to be blocked"
				  },
				  responses: {
					200: "Company blocked successfully",
					401: "Unauthorized - Invalid or missing token",
					404: "Company not found"
				  }
				},
				listInvoices: {
				  description: "Returns the list of invoices associated with the company of the token.",
				  params: {
					companyId: "Company ID (optional, will be obtained from the token if not provided)"
				  },
				  responses: {
					200: "Invoices listed successfully",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				getInvoice: {
				  description: "Returns the details of a specific invoice.",
				  params: {
					Invoiceid: "ID of the invoice to be displayed"
				  },
				  responses: {
					200: "Invoice details obtained successfully",
					401: "Unauthorized - Invalid or missing token"
				  }
				},
				getDashboardOverview: {
				  description: "Returns metrics and statistical data for the dashboard.",
				  params: {
					period: "Period for analysis ('day', 'week', or 'month')",
					date: "Reference date (YYYY-MM-DD)",
					userId: "User ID to filter (optional)",
					queueId: "Queue ID to filter (optional)"
				  },
				  responses: {
					200: "Dashboard data obtained successfully",
					400: "Validation error",
					401: "Unauthorized - Invalid or missing token",
					500: "Internal server error"
				  },
				  exampleTitle: "Example of obtaining dashboard data:"
				}
			  }
			}
		  },
		invoices: {
		  title: "Invoices",
		  search: "Search invoices...",
		  toggleView: "Toggle view",
		  id: "ID",
		  details: "Details",
		  value: "Value",
		  dueDate: "Due Date",
		  status: "Status",
		  actions: "Actions",
		  pay: "Pay",
		  paid: "Paid",
		  pending: "Open",
		  overdue: "Overdue",
		  editDueDate: "Edit Due Date",
		  newDueDate: "New Due Date",
		  updating: "Updating...",
		  confirm: "Confirm",
		  cancel: "Cancel",
		  sendWhatsapp: "Send via WhatsApp",
		  sendEmail: "Send by Email",
		  dueDateUpdated: "Due date updated successfully",
		  errorUpdatingDueDate: "Error updating due date",
		  messageSent: "Message sent successfully",
		  messageError: "Error sending message",
		  emailSent: "Email sent successfully",
		  emailError: "Error sending email",
		  loadError: "Error loading invoices",
		  emailSubject: "Invoice #${id}",
		  superUserOnly: "Only super users can perform this action",
		  whatsappMessage: {
			header: "Invoice Details",
			id: "Invoice Number",
			dueDate: "Expiration Date",
			value: "Value",
			paymentInfo: "Payment Information",
			footer: "If you have any questions, please contact us"
		  },
		  emailBody: {
			header: "Details of your Invoice",
			id: "Invoice Number",
			dueDate: "Expiration Date",
			value: "Value",
			paymentInstructions: "Payment Instructions",
			footer: "Thank you for your preference"
		  },
		  cardView: {
			dueIn: "Due in",
			overdueDays: "Overdue by",
			days: "days"
		  }
		},
		financial: {
		  title: "Financial",
		  selectCompany: "Select Company",
		  allCompanies: "All Companies",
		  company: "Company",
		  value: "Value",
		  dueDate: "Due Date",
		  invalidDate: "Invalid date",
		  dueDateRequired: "Due date is mandatory",
		  dueDateFuture: "The date must be in the future",
		  dateNotInformed: "Date not informed",
		  viewInvoice: "View Invoice",
		  from: "From",
		  to: "To",
		  description: "Description",
		  payOnline: "Pay Online via PIX",
		  terms: "This invoice was generated automatically. For more information, please contact us.",
		  status: {
			tableHeader: "Status",
			allStatus: "All statuses",
			paid: "Paid",
			pending: "Pending",
			open: "Open",
			overdue: "Overdue"
		  },
		  actions: "Actions",
		  editDueDate: "Edit Due Date",
		  sendEmail: "Send Email",
		  sendWhatsapp: "Send WhatsApp",
		  deleteInvoice: "Delete Invoice",
		  payInvoice: "Pay Invoice",
		  pay: "Pay",
		  confirmDelete: "Confirm Deletion",
		  deleteWarning: "This action cannot be undone.",
		  deleteConfirmation: "Are you sure you want to delete this invoice?",
		  invoice: "Invoice",
		  newDueDate: "New Due Date",
		  cancel: "Cancel",
		  confirm: "Confirm",
		  dueDateUpdated: "Due date updated successfully",
		  invoiceDeleted: "Invoice deleted successfully",
		  emailSent: "Email sent successfully",
		  whatsappSent: "WhatsApp message sent successfully",
		  errorLoadingCompanies: "Error loading companies",
		  errorLoadingInvoices: "Error loading invoices",
		  errorUpdatingDueDate: "Error updating due date",
		  errorDeletingInvoice: "Error deleting invoice",
		  errorSendingEmail: "Error sending email",
		  errorSendingWhatsapp: "Error sending WhatsApp message",
		  noCompanyAccess: "User does not have an associated company",
		  noInvoices: "No invoice found",
		  accessDenied: "Unauthorized access",
		  superUserIndicator: "Super User",
		  emitter: "Issuer",
		  recipient: "Recipient",
		  invoiceNumber: "Invoice #%{number}",
		  tableInvoice: "Invoice #",
		  companyLogo: "Company Logo",
		  closeModal: "Close modal",
		  errorLoadingCompany: "Error loading company data",
		  loading: "Loading...",
		  companyDetails: "Company Details",
		  paymentInstructions: "Payment Instructions",
		  generatedAt: "Generated on",
		  payWithPix: "Pay with PIX",
		  pixCode: "PIX Code (click to copy)",
		  pixCopied: "PIX code copied!",
		  scanQrCode: "Scan the QR Code",
		  copyPixCode: "Copy PIX code",
		  filterStatus: "Status",
		  allStatus: "All statuses"
		},
		deleteConfirmationDialog: {
		  cancelButton: "Cancel",
		  confirmButton: "Confirm Deletion",
		  defaultTitle: "Confirm Deletion",
		  defaultWarning: "This action cannot be undone!",
		  defaultConfirmation: "Are you sure you want to delete this item?"
		},
		errors: {
		  required: "This field is required",
		  invalid: "Invalid value",
		  invalidEmail: "Invalid email",
		  invalidPhone: "Invalid phone number",
		  invalidCep: "Invalid ZIP code",
		  invalidCpf: "Invalid CPF",
		  invalidCnpj: "Invalid CNPJ",
		  minLength: "Minimum of {min} characters",
		  maxLength: "Maximum of {max} characters"
		},
		modal: {
		  scheduling: {
			title: "Scheduling Time",
			description: "All schedules will be sent between 18:00 and 18:30."
		  },
		  recurring: {
			title: "Recurring Scheduling",
			steps: {
			  intro: "Follow these steps:",
			  step1: "Go to the Campaign Tags tab",
			  step2: "Create new tags, if necessary",
			  substeps: {
				title: "Set up your campaign:",
				settings: "Go to the settings gear",
				board: "Select one of the available boards",
				message: "Change the message to be sent",
				file: "If necessary, choose a file to be sent",
				frequency: "Choose the scheduling frequency (every how many days)",
				save: "Click Save"
			  }
			}
		  },
		  openTickets: {
			title: "Tickets Without Active Campaigns",
			description: "All tickets without active campaigns will go to the \"Open\" board"
		  },
		  campaign: {
			title: "Create a Campaign",
			description: "To create a campaign, drag the ticket to the campaign board of your choice"
		  },
		  moving: {
			title: "Move Tickets between Boards",
			rules: {
			  rule1: "When moving a ticket to a board, the scheduling will be based on the board's settings",
			  rule2: "When moving a ticket to another board, existing schedules will be deleted and a new schedule will be created according to the chosen board",
			  rule3: "When moving a ticket back to the \"Open\" board, existing schedules of the ticket will be deleted"
			}
		  },
		  close: "Close modal"
		},
		splash: {
		  title: "AutoAssist",
		  subtitle: "Intelligent Customer Service",
		  loading: "Loading...",
		  initializing: "Starting...",
		  loadingResources: "Loading resources...",
		  preparingInterface: "Preparing interface...",
		  configuringEnvironment: "Setting up environment...",
		  finishingUp: "Finishing..."
		},
		home: {
		  nav: {
			features: "Features",
			pricing: "Prices",
			about: "About",
			login: "Log in",
			getStarted: "Get Started Now"
		  },
		  hero: {
			title: "Transform Your Customer Service with AI",
			subtitle: "Automate, optimize, and scale your customer service with intelligent AI-based solutions.",
			cta: {
			  primary: "Free Trial",
			  secondary: "Learn More"
			}
		  },
		  stats: {
			clients: "Active Clients",
			uptime: "Availability",
			support: "Customer Support"
		  },
		  features: {
			title: "Powerful Features",
			subtitle: "Everything you need to provide exceptional customer service",
			chatbot: {
			  title: "AI Chatbot",
			  description: "Intelligent automated responses with advanced natural language processing."
			},
			messaging: {
			  title: "Unified Messages",
			  description: "Manage all conversations with your customers in a single centralized platform."
			},
			ai: {
			  title: "AI Analysis",
			  description: "Gain deep insights into customer interactions and service performance."
			},
			automation: {
			  title: "Intelligent Automation",
			  description: "Automate routine tasks and focus on what really matters."
			},
			security: {
			  title: "Enterprise Security",
			  description: "Bank-level security and data protection for your peace of mind."
			},
			api: {
			  title: "API for Developers",
			  description: "Easily integrate with your existing systems and workflows."
			}
		  },
		  pricing: {
			title: "Simple and Transparent Pricing",
			subtitle: "Choose the plan that best suits your needs",
			popularLabel: "Most Popular",
			ctaButton: "Get Started Now",
			basic: {
			  title: "Basic",
			  feature1: "1 Operator",
			  feature2: "1 WhatsApp Channel",
			  feature3: "Basic Dashboard",
			  feature4: "Email Support"
			},
			pro: {
			  title: "Professional",
			  feature1: "5 Operators",
			  feature2: "3 WhatsApp Channels",
			  feature3: "Advanced Analytics",
			  feature4: "Priority Support"
			},
			enterprise: {
			  title: "Enterprise",
			  feature1: "Unlimited Operators",
			  feature2: "Unlimited Channels",
			  feature3: "Custom Integration",
			  feature4: "24/7 Support"
			}
		  },
		  footer: {
			description: "AutoAtende helps companies offer exceptional customer service through AI-powered automation.",
			product: {
			  title: "Product",
			  features: "Features",
			  pricing: "Prices",
			  api: "API"
			},
			company: {
			  title: "Company",
			  about: "About Us",
			  contact: "Contact",
			  careers: "Careers"
			},
			legal: {
			  title: "Legal",
			  privacy: "Privacy Policy",
			  terms: "Terms of Service",
			  cookies: "Cookie Policy"
			},
			rights: "All rights reserved."
		  }
		},
		connections: {
		  title: "Connections",
		  noConnections: "No connection found",
		  buttons: {
			add: "Add connection",
			restartAll: "Restart all",
			qrCode: "View QR Code",
			tryAgain: "Try again",
			disconnect: "Disconnect",
			newQr: "New QR Code",
			connecting: "Connecting...",
			refreshQrCode: "Update QR Code",
			generatingQrCode: "Generating QR Code...",
			generateQrCode: "Generate QR Code",
			showQrCode: "Show QR Code"
		  },
		  status: {
			disconnected: "Disconnected"
		  },
		  menu: {
			duplicate: "Duplicate connection",
			transferTickets: "Transfer tickets and delete",
			delete: "Delete connection",
			forceDelete: "Force deletion",
			importMessages: "Import Messages"
		  },
		  confirmationModal: {
			deleteTitle: "Delete connection",
			deleteMessage: "Are you sure you want to delete this connection? All related interactions will be lost.",
			disconnectTitle: "Disconnect session",
			disconnectMessage: "Are you sure you want to disconnect this session?",
			forceDeleteTitle: "Force deletion",
			forceDeleteMessage: "WARNING: This action will delete the connection even if there are open tickets. Are you sure?",
			transferTitle: "Transfer Tickets",
			transferMessage: "Select the target connection for the tickets:"
		  },
		  toasts: {
			deleted: "Connection successfully deleted.",
			deleteError: "Error deleting connection.",
			disconnected: "Connection successfully disconnected.",
			disconnectError: "Error disconnecting connection.",
			qrCodeGenerated: "QR Code generated successfully.",
			qrCodeError: "Error generating QR Code.",
			reconnectRequested: "Reconnection requested successfully.",
			reconnectError: "Error requesting reconnection.",
			connectionStarted: "Starting session...",
			startError: "Error starting session.",
			fetchError: "Error fetching connections.",
			restartSuccess: "All connections are being restarted.",
			duplicated: "Connection duplicated successfully.",
			duplicateError: "Error duplicating connection.",
			transferSuccess: "Tickets transferred and connection deleted successfully.",
			transferError: "Error transferring tickets."
		  },
		  table: {
			name: "Name",
			number: "Number",
			status: "Status",
			default: "Pattern",
			lastUpdate: "Last update",
			session: "Session",
			actions: "Actions"
		  },
		  import: {
			title: "Message Import",
			preparingImport: "Preparing import...",
			pleaseWait: "Please wait while we prepare the data for import.",
			importingMessages: "Importing messages",
			progress: "Progress",
			doNotClose: "Do not close this window while the import is in progress.",
			importComplete: "Import completed",
			messagesImported: "{count} messages were imported successfully.",
			closeTicketsTitle: "Close imported tickets",
			closeTicketsDescription: "You can automatically close all tickets created during the import to keep your workspace organized.",
			closeTicketsButton: "Close imported tickets",
			importError: "Import error",
			genericError: "An error occurred during the import process.",
			refresh: "Refresh page"
		  }
		},
		qrCode: {
		  title: "QR Code",
		  instructions: "Scan the QR Code with your phone to connect",
		  timeRemaining: "Time remaining",
		  noQrFound: "No QR Code found",
		  expired: "QR Code expired. Click to generate a new one",
		  connected: "Connected successfully!"
		},
		fileImport: {
		  title: "File Import",
		  startButton: "Start Import",
		  companyRequired: "Company is mandatory",
		  processedFiles: "{{processed}} out of {{total}} files processed",
		  errors: "{{count}} errors found",
		  successMessage: "Import completed successfully! {{total}} files processed.",
		  errorMessage: "Error during import. Please try again.",
		  startError: "Error starting import",
		  complete: "Import completed successfully!",
		  error: "Erro durante a importação"
		},
		oldsettings: {
		  tabs: {
			ai: "Artificial Intelligence",
			generalParams: "General Parameters",
			advanced: "Advanced Settings"
		  },
		  openai: {
			label: "OpenAI Model",
			helper: "Choose the OpenAI artificial intelligence model to use in automatic responses. Essential to ensure the quality and accuracy of automatic responses, improving service efficiency.",
			models: {
			  gpt4o: "GPT-4o - Main model for complex tasks",
			  gpt4oMini: "GPT-4o Mini - Lightweight and fast model",
			  gpt4Turbo: "GPT-4 Turbo - Latest version with vision capabilities",
			  o1Preview: "O1 Preview - Model focused on reasoning",
			  o1Mini: "O1 Mini - Fast model for code and mathematics"
			}
		  },
		  downloadLimit: {
			label: "Download Limit (MB)",
			helper: "Sets the maximum limit for file download in megabytes"
		  },
		  oneTicket: {
			label: "Enable use of one ticket per connection",
			helper: "When activating this function, each different client connection will generate a distinct ticket"
		  },
		  signup: {
			label: "Enable registration on signup",
			helper: "Allows new users to register on the platform"
		  },
		  emailRegister: {
			label: "Send email on registration",
			helper: "Sends confirmation email using the main company"
		  },
		  messageRegister: {
			label: "Send message on registration",
			helper: "Sends welcome message when registering"
		  },
		  closeTicketReason: {
			label: "Display reason when closing ticket",
			helper: "Requests reason for closure when finishing service"
		  },
		  showSku: {
			label: "Display ticket value and SKU",
			helper: "Shows value and SKU information during service"
		  },
		  quickMessages: {
			label: "Quick Messages",
			company: "By Company",
			individual: "By User",
			helper: "Defines how quick messages will be organized"
		  },
		  greetingMessage: {
			label: "Send greeting when accepting ticket",
			helper: "Sends automatic message when accepting service"
		  },
		  userRating: {
			label: "User Evaluation",
			helper: "Allows customers to evaluate the service"
		  },
		  schedule: {
			label: "Shift Management",
			disabled: "Disabled",
			company: "By Company",
			queue: "By Department",
			helper: "Defines how service hours will be controlled"
		  },
		  ignoreGroup: {
			label: "Ignore group messages",
			helper: "Does not process messages from groups"
		  },
		  acceptCalls: {
			label: "Accept calls",
			helper: "Allows receiving voice and video calls"
		  },
		  chatbot: {
			label: "Chatbot Type",
			text: "Text",
			helper: "Defines the chatbot interaction format"
		  },
		  transferMessage: {
			label: "Transfer Message",
			helper: "Sends message when transferring service"
		  },
		  queueGreeting: {
			label: "Greeting in single department",
			helper: "Sends greeting when there is only one department"
		  },
		  glpi: {
			label: "Integration with GLPI",
			config: "GLPI Settings",
			urlApi: "API URL",
			appToken: "App Token",
			masterToken: "Master Token",
			helper: "Allows integration with GLPI system",
			configHelper: "Set up credentials for integration with GLPI",
			saveButton: "Save GLPI Settings",
			requiredFields: "Fill in all mandatory fields of GLPI"
		  },
		  omie: {
			label: "Integration with Omie",
			config: "Omie Settings",
			appKey: "App Key",
			appSecret: "App Secret",
			helper: "Allows integration with Omie system",
			configHelper: "Set up credentials for integration with Omie",
			saveButton: "Save Omie Settings",
			requiredFields: "Fill in all mandatory fields of Omie"
		  },
		  ixc: {
			title: "IXC",
			ip: "IXC IP",
			token: "IXC Token"
		  },
		  mkauth: {
			title: "MK-AUTH",
			ip: "MK-AUTH IP",
			clientId: "Client ID",
			clientSecret: "Client Secret"
		  },
		  asaas: {
			title: "ASAAS",
			token: "ASAAS Token"
		  },
		  smtp: {
			title: "SMTP",
			server: "SMTP Server",
			username: "SMTP User",
			password: "SMTP Password",
			port: "SMTP Port"
		  },
		  support: {
			title: "Support",
			whatsapp: "Support WhatsApp",
			message: "Default Message"
		  },
		  apiToken: {
			label: "API Token",
			copied: "Token copied to clipboard",
			generate: "Generate new token",
			delete: "Delete token"
		  },
		  success: "Operation successful",
		  loading: "Updating...",
		  error: "An error occurred in the operation",
		  save: "Save",
		  cancel: "Cancel"
		},
		satisfactionSurvey: {
		  tooltip: "You have {{count}} pending satisfaction survey(s)",
		  reminderTitle: "Your opinion is important!",
		  reminderMessage: "You have {{count}} satisfaction survey(s) awaiting response.",
		  reminderSubtext: "Your feedback helps us continuously improve AutoAtende.",
		  remindLater: "Remind me later",
		  openNow: "Respond now"
		},
		flowBuilder: {
		  list: {
			title: "Flow Builder",
			searchPlaceholder: "Search by name",
			newFlow: "New Flow",
			name: "Name",
			whatsapp: "WhatsApp",
			status: "Status",
			createdAt: "Created at",
			actions: "Actions",
			active: "Active",
			inactive: "Inactive",
			edit: "Edit",
			test: "Test",
			delete: "Delete",
			duplicate: "Duplicate",
			duplicateSuccess: "Flow duplicated successfully",
			duplicateError: "Error duplicating flow",
			importFlow: "Import Flow",
			createFirst: "Create the first flow now",
			createSuccess: "Flow created successfully",
			confirmDelete: "Confirm deletion",
			confirmDeleteMessage: "Are you sure you want to delete the flow {{name}}?",
			noFlows: "No flow found",
			noSearchResults: "No flow found with the search criteria",
			fetchError: "Error fetching flows",
			deleteError: "Error deleting flow",
			deleteSuccess: "Flow deleted successfully",
			testError: "Error testing flow",
			testSuccess: "Flow test started successfully",
			toggleError: "Error changing flow status"
		  },
		  import: {
			title: "Import Flow",
			instruction: "Select or drag a previously exported JSON flow file.",
			dropFile: "Click or drag a file here",
			fileFormat: "Only JSON files are accepted",
			noFileSelected: "Please select a file to import",
			success: "Flow imported successfully",
			error: "Error importing flow",
			action: "Import"
		  },
		  create: "Create",
		  editing: "Editing flow",
		  createNew: "Create new flow",
		  save: "Save",
		  test: "Test",
		  validate: "Validate",
		  preview: {
			title: "Preview",
			simulation: "Flow simulation",
			welcome: "Starting flow simulation...",
			startNode: "Flow started",
			endNode: "Flow finished",
			terminalNode: "Flow finished",
			switchFlow: "Switching flow to",
			attendantNode: "Transferring to human attendant...",
			apiCall: "API call to",
			apiSuccess: "Call completed successfully!",
			evaluating: "Evaluating variable:",
			conditionMatch: "Matching condition",
			defaultPath: "Following default path",
			typeMessage: "Type a message...",
			disabled: "Simulation in progress...",
			restart: "Restart simulation",
			pauseAuto: "Pause autoplay",
			playAuto: "Start autoplay",
			next: "Next step",
			completed: "Simulation completed",
			waitingInput: "Waiting for user input",
			inProgress: "In progress",
			openaiCall: "Starting integration with OpenAI: {name}",
			openaiResponse: "OpenAI response generated successfully!",
			tagOperation: "Running TAG node",
			queueTransfer: "Running Queue Transfer node",
			withVoice: "Response converted to audio",
			typebotStart: "Starting Typebot flow: {name}",
			typebotComplete: "Typebot flow: {name} completed successfully",
			menuTitle: "Menu presented to the user",
			menuOption: "Menu option selected",
			inputRequired: "Please provide a {type} type response",
			validationRequired: "The response will be validated as: {type}",
			validationFailed: "The response did not pass validation. Simulating error flow."
		  },
		  saveFlow: "Save flow",
		  close: "Close",
		  export: "Export flow",
		  validationErrorOutput: "Error output",
		  success: {
			saved: "Flow saved successfully",
			testStarted: "Test started successfully",
			exported: "Flow exported successfully"
		  },
		  validation: {
			nameRequired: "Name is required",
			whatsappRequired: "WhatsApp selection is required",
			apiKeyRequired: "API key is mandatory",
			promptRequired: "Prompt is mandatory",
			urlRequired: "URL is mandatory",
			invalidUrl: "Invalid URL",
			typebotIdRequired: "Typebot ID is mandatory",
			fixErrors: "Please correct the errors before saving"
		  },
		  outputs: {
			success: "Success",
			error: "Error",
			below: "below",
			right: "right",
			noSelection: "No selection"
		  },
		  errors: {
			loadFailed: "Failed to load flow",
			saveFailed: "Failed to save flow",
			testFailed: "Failed to start test",
			exportFailed: "Failed to export flow"
		  },
		  form: {
			name: "Flow name",
			description: "Description",
			whatsapp: "WhatsApp",
			selectWhatsapp: "Select a WhatsApp"
		  },
		  sidebar: {
			nodes: "Available nodes",
			dragHelp: "Drag the nodes to the flow",
			connectHelp: "Connect the nodes to create your flow",
			help: "Help",
			messageNodes: "MESSAGES",
			flowNodes: "FLOW",
			integrationNodes: "INTEGRATIONS",
			helpTooltip: "Nodes documentation",
			tagDescription: "Add or remove tags from contacts"
		  },
		  help: {
			title: "Documentação dos Nós",
			introduction: "Nodes are the basic elements for building flows. Each type of node has specific functionalities and can be configured for different behaviors. This documentation provides detailed information about each type of node available in the system.",
			propertiesSection: "Properties",
			connectionsSection: "Connections",
			usageSection: "How to Use",
			exampleSection: "Example:",
			propertyName: "Property",
			propertyDescription: "Description",
			connectionType: "Type",
			connectionDescription: "Description",
			menuNode: {
			  title: "Menu",
			  description: "This node creates an interactive menu with options for the user to choose.",
			  properties: {
				label: "Node identifier label (optional)",
				menuTitle: "Title that will be displayed in the menu",
				menuOptions: "List of menu options that the user can select",
				useEmoji: "Option to use emojis in the menu options"
			  },
			  connections: {
				defaultOutput: "Default output used when no option is selected",
				optionOutputs: "One output for each menu option, allowing different flows based on the user's choice"
			  },
			  usage: "Use this node to present a set of options for the user to choose, creating targeted interactions and branches in the flow.",
			  example: "A menu for the user to choose which type of service they want: \"Technical Support\", \"Sales\", \"Complaints\"."
			},
			properties: {
			  label: "Label",
			  messageType: "Message Type",
			  message: "Message",
			  mediaUrl: "Media URL",
			  caption: "Caption",
			  question: "Question",
			  variableName: "Variable Name",
			  inputType: "Input Type",
			  options: "Options",
			  variable: "Variable",
			  conditions: "Conditions",
			  targetFlow: "Destination Flow",
			  transferVariables: "Transfer Variables",
			  assignmentType: "Assignment Type",
			  assignedUser: "Assigned Attendant",
			  timeout: "Timeout",
			  endFlow: "End Flow",
			  method: "HTTP Method",
			  url: "URL",
			  headers: "Headers",
			  secretKey: "Secret Key",
			  contentType: "Content-Type",
			  body: "Body",
			  queryParams: "Query Parameters",
			  responseVariable: "Response Variable",
			  responseFilter: "Response Filter",
			  authentication: "Authentication",
			  validationType: "Validation Type",
			  useValidationErrorOutput: "Use output for error"
			},
			connections: {
			  input: "Input",
			  output: "Output",
			  singleInput: "An input at the top of the node",
			  singleOutput: "An output at the bottom of the node"
			},
			messageNode: {
			  title: "Message Node",
			  description: "The message node allows sending a simple text message to the contact. It is the most basic and commonly used node type.",
			  properties: {
				label: "Node identification name in the flow",
				messageType: "Message type (text, image, audio, video, file)",
				message: "Content of the message to be sent",
				mediaUrl: "Media URL to be sent (for non-text types)"
			  },
			  usage: "Use this node to send information, instructions, or multimedia content to the contact. It is ideal for providing information or instructions before asking questions.",
			  example: "Send a welcome message, explain how a service works, or send a promotional image."
			},
			imageNode: {
			  title: "Image Node",
			  description: "The image node allows sending an image to the contact, with the option to include an explanatory caption.",
			  properties: {
				label: "Node identification name in the flow",
				mediaUrl: "The image to be sent (upload or URL)",
				caption: "Optional text accompanying the image"
			  },
			  usage: "Use this node when you need to send images such as product photos, visual instructions, infographics, or any visual content.",
			  example: "Send a product catalog, a location map, or a promotional banner."
			},
			queueNode: {
			  title: "Sector",
			  description: "This node transfers the service to a specific sector and ends the flow.",
			  properties: {
				label: "Node identifier label (optional)",
				queue: "Sector to which the service will be transferred"
			  },
			  connections: {
				output: "No output - ends the flow and transfers to the sector"
			  },
			  usage: "Use this node when you need to transfer the service to a specific sector and end the current flow. The ticket will remain pending in the selected sector.",
			  example: "A customer requests specialized service, and you transfer the ticket to the \"Technical Support\" sector, ending the bot flow."
			},
			openaiNode: {
			  title: "OpenAI Node",
			  description: "The OpenAI node allows integrating artificial intelligence into your flow, generating responses based on advanced language models.",
			  properties: {
				label: "Label for node identification in the flow",
				name: "Integration name for reference",
				apiKey: "API key for authentication in the OpenAI service",
				prompt: "Detailed instructions to guide the model's behavior",
				voice: "Option to convert text to speech with available voices",
				temperature: "Controls the randomness of responses (0-2)",
				maxTokens: "Limits the size of the generated response",
				maxMessages: "Sets the maximum number of interactions for context"
			  },
			  usage: "Use to create virtual assistants, answer questions with AI, or generate dynamic content based on user inputs.",
			  example: "A virtual assistant that answers questions about company products, using a custom prompt to ensure accurate and brand-aligned responses."
			},
			typebotNode: {
			  title: "Typebot Node",
			  description: "The Typebot node allows integrating external flows created on the Typebot platform, enabling complex and personalized conversational experiences.",
			  properties: {
				label: "Label for node identification in the flow",
				name: "Integration name for reference",
				typebotUrl: "Base URL of Typebot where the flow is hosted",
				typebotId: "Unique identifier of the Typebot flow to be integrated",
				typebotToken: "Authentication token to access protected flows",
				saveResponse: "Option to store user responses in the Typebot flow"
			  },
			  usage: "Use to integrate pre-built complex flows, questionnaires, forms, or structured data collection processes.",
			  example: "A lead qualification process that uses a Typebot to collect specific customer information before forwarding to a human attendant."
			},
			questionNode: {
			  title: "Question Node",
			  description: "The question node allows asking a question to the contact and capturing their response, being able to offer predefined options or accept free responses.",
			  properties: {
				label: "Node identification name in the flow",
				question: "The question to be sent to the contact",
				variableName: "Name of the variable where the response will be stored",
				inputType: "Expected response type (options, text, number, email, phone)",
				options: "List of options for the contact to choose (when the type is \"options\")",
				validationType: "Defines the type of validation to be applied to the response",
				useValidationErrorOutput: "Creates an additional output to handle validation errors"
			  },
			  connections: {
				defaultOutput: "Default output for free text type or when no option matches",
				optionOutputs: "One output for each defined option (when the type is \"options\")",
				validationErrorOutput: "Output used when the response fails validation"
			  },
			  usage: "Use this node to interact with the contact, collect information, or direct the flow based on their choices.",
			  example: "Ask which department the contact wants to speak to, request an email for registration, or ask for a numerical evaluation from 1 to 5."
			},
			conditionalNode: {
			  title: "Condition Node",
			  description: "The condition node allows branching the flow based on the value of a variable, creating different paths depending on the met condition.",
			  properties: {
				label: "Node identification name in the flow",
				variable: "Name of the variable to be evaluated in the conditions",
				conditions: "List of conditions with expected values and corresponding destinations"
			  },
			  connections: {
				defaultOutput: "Default output when no condition is met",
				conditionOutputs: "One output for each defined condition"
			  },
			  usage: "Use this node to create branches in the flow based on previously collected information or system variables.",
			  example: "Check if the customer is already registered, direct to different departments according to the previous choice, or customize the flow based on customer data."
			},
			endNode: {
			  title: "End Node",
			  description: "The end node marks the end of a path in the flow. When the flow reaches this node, the execution is terminated for the contact.",
			  properties: {
				label: "Node identification name in the flow"
			  },
			  connections: {
				output: "Does not have outputs"
			  },
			  usage: "Use this node to mark the end of a path in the flow, ending the automated interaction.",
			  example: "Finish the service after providing the requested information, end the flow after data collection, or finish a specific branch of the flow."
			},
			switchFlowNode: {
			  title: "Flow Change Node",
			  description: "The flow change node allows transferring the execution to another flow, enabling the modularization of flows into smaller and reusable parts.",
			  properties: {
				label: "Node identification name in the flow",
				targetFlow: "Flow to which the execution will be transferred",
				transferVariables: "Option to transfer the variables from the current flow to the new flow"
			  },
			  connections: {
				output: "Does not have outputs in the current flow, as the execution is transferred to another flow"
			  },
			  usage: "Use this node to create modular flows that can be reused in different contexts or to organize complex flows into smaller parts.",
			  example: "Transfer to a registration flow, start a payment flow, or direct to a specific submenu."
			},
			attendantNode: {
			  title: "Attendant Node",
			  description: "The attendant node transfers the conversation to a human attendant, allowing the continuation of service by a real operator.",
			  properties: {
				label: "Node identification name in the flow",
				assignmentType: "Determines if the assignment will be manual (to a specific attendant) or automatic (based on sector)",
				assignedUser: "Specific attendant to whom the service will be directed (when the type is \"manual\")",
				timeout: "Maximum waiting time for service assignment",
				endFlow: "Determines if the flow will be terminated after the transfer to the attendant"
			  },
			  connections: {
				output: "An output that will be followed if the service is not assigned within the timeout"
			  },
			  usage: "Use this node when the contact needs to speak with a human agent, either to solve complex issues or provide personalized assistance.",
			  example: "Transfer to an agent after unsuccessful attempts of automated resolution, direct to a specialist in a specific subject, or offer human assistance as an option."
			},
			webhookNode: {
			  title: "Webhook Node",
			  description: "The webhook node allows making HTTP calls to external systems, sending and receiving data for integration with other platforms.",
			  properties: {
				label: "Node identification name in the flow",
				method: "Request method (GET, POST, PUT, PATCH, DELETE)",
				url: "Endpoint address to which the request will be sent",
				headers: "HTTP headers to be sent with the request",
				variableName: "Name of the variable where the response will be stored",
				secretKey: "Key for HMAC request signature (security)"
			  },
			  usage: "Use this node to integrate the flow with external systems, fetch or send data to other platforms.",
			  example: "Check the status of an order in an e-commerce, send registration data to a CRM, or query information in an external API."
			},
			apiNode: {
			  title: "API Request Node",
			  description: "The API Request node allows making more elaborate API calls with advanced settings, error handling, and response processing.",
			  properties: {
				label: "Node identification name in the flow",
				method: "Request method (GET, POST, PUT, PATCH, DELETE)",
				url: "Endpoint address to which the request will be sent",
				headers: "HTTP headers to be sent with the request",
				contentType: "Content type of the request body",
				body: "Data to be sent in the request body (for non-GET methods)",
				queryParams: "Parameters to be added to the URL as a query string",
				responseVariable: "Name of the variable where the response will be stored",
				responseFilter: "JSONPath path to extract only part of the response",
				authentication: "Authentication settings (Basic Auth, Bearer Token, API Key)"
			  },
			  connections: {
				successOutput: "Output followed when the request is successful",
				errorOutput: "Output followed when the request fails"
			  },
			  usage: "Use this node for advanced integrations with APIs that require specific settings, error handling, or data processing.",
			  example: "Integrate with payment APIs, complex CRM systems, or services that require specific authentication and elaborate response handling."
			},
			tagNode: {
			  title: "Tag Node",
			  description: "The tag node allows adding or removing tags from contacts. Tags are useful for segmentation and campaign automation.",
			  properties: {
				label: "Node identification name in the flow",
				operation: "Defines if the tags will be added or removed from the contact",
				selectionMode: "Determines if only one or multiple tags will be handled",
				tags: "List of tags to be added or removed from the contact"
			  },
			  connections: {
				output: "An output that will be followed after adding/removing the tags"
			  },
			  usage: "Use this node to add or remove tags from contacts during the conversation flow, allowing future segmentation.",
			  example: "Add a 'Interested' tag when the contact shows interest in a product, or remove the 'Not contacted' tag after the first interaction."
			}
		  },
		  openai: {
			name: "Integration name",
			apiKey: "OpenAI API key",
			prompt: "Prompt",
			promptHelp: "Enter instructions for the OpenAI model",
			voice: "Voice",
			voiceKey: "Voice API key",
			voiceRegion: "Voice API region",
			temperature: "Temperature",
			maxTokens: "Maximum tokens",
			maxMessages: "Maximum messages",
			helpText: "This node allows integrating OpenAI into your flow to create dynamic responses based on artificial intelligence. Define the appropriate prompt to guide the model's behavior."
		  },
		  typebot: {
			name: "Integration name",
			typebotUrl: "Typebot URL",
			typebotUrlHelp: "Full URL of your Typebot (e.g. https://bot.example.com)",
			typebotId: "Typebot ID",
			typebotToken: "Typebot Token",
			typebotTokenHelp: "Optional. Used for authentication",
			saveResponse: "Save Typebot response",
			helpText: "This node allows you to integrate a Typebot flow into your service. Set the correct URL and ID to direct the user to the appropriate flow."
		  },
		  queue: {
			transferTo: "Transfer to department",
			selectQueue: "Select the sector",
			queueRequired: "Department is mandatory",
			endFlow: "Ends the flow",
			terminalDescription: "When the service is transferred to a department, the flow ends. The ticket will remain pending in the selected department.",
			helpText: "Note: The department node transfers the conversation to a specific department. The flow will end and the ticket will remain pending in the selected department."
		  },
		  nodes: {
			start: "Start",
			end: "End",
			message: "Message",
			conditional: "Condition",
			attendant: "Attendant",
			switchFlow: "Change flow",
			user: "User",
			location: "Location",
			outputs: "This node has {{count}} outputs",
			openai: "OpenAI",
			typebot: "Typebot",
			queue: "Sector",
			webhook: "Webhook",
			image: "Image",
			question: "Question",
			withVoice: "With Voice",
			automatedFlow: "Automated Flow",
			api: "API Request",
			tag: {
			  title: "Tag",
			  configuration: "Tag Configuration",
			  selectTags: "Select Tags",
			  searchTags: "Search tags",
			  createTag: "Create tag",
			  noTags: "No tag found",
			  noTagsSelected: "No tag selected",
			  noResults: "No results found",
			  operation: "Operation",
			  addOperation: "Add tag",
			  removeOperation: "Remove tag",
			  selectionMode: "Selection mode",
			  singleMode: "Single tag",
			  multipleMode: "Multiple tags",
			  selectOne: "Select a tag",
			  selectMultiple: "Select one or more tags",
			  preview: "Preview",
			  willAdd: "Will be added to contact:",
			  willRemove: "Will be removed from contact:",
			  helpText: "This node allows you to add or remove tags from contacts. Tags are useful for segmentation and campaign automation."
			}
		  },
		  properties: {
			title: "Node Properties",
			label: "Label",
			message: "Message",
			messagePlaceholder: "Enter the message to send...",
			messageType: "Message type",
			variable: "Variable",
			variablePlaceholder: "Variable name to be evaluated",
			conditions: "Conditions",
			conditionValue: "Condition value",
			targetNode: "Destination node",
			addCondition: "Add condition",
			unknownNodeType: "Unknown node type",
			buttons: "Buttons",
			buttonText: "Button text",
			buttonValue: "Button value",
			addButton: "Add button",
			mode: "Mode",
			flow: "Flow",
			timeout: "Timeout",
			caption: "Caption",
			address: "Address",
			url: "URL",
			method: "Method",
			headers: "Headers",
			body: "Request body",
			responseVariable: "Response Variable",
			authType: "Authentication type",
			maxMessages: "Maximum messages",
			name: "Name",
			apiKey: "API key",
			prompt: "Prompt",
			voice: "Voice",
			temperature: "Temperature",
			maxTokens: "Maximum tokens",
			typebotUrl: "Typebot URL",
			typebotId: "Typebot ID",
			typebotToken: "Typebot Token",
			saveResponse: "Save response",
			types: {
			  text: "Text",
			  image: "Image",
			  audio: "Audio",
			  video: "Video",
			  file: "File",
			  button: "Buttons",
			  list: "List"
			},
			mediaUrl: "Media URL",
			mediaUrlPlaceholder: "Enter the media URL",
			listItems: "List items",
			listTitle: "List title",
			listButtonText: "List button text",
			triggers: "Triggers",
			triggersPlaceholder: "Words that start the flow (separated by comma)",
			exclusive: "Exclusive (prevents other flows)"
		  },
		  controls: {
			zoomIn: "Zoom in",
			zoomOut: "Zoom out",
			fitView: "Fit to screen",
			undo: "Undo",
			redo: "Redo"
		  },
		  tooltips: {
			deleteNode: "Delete node",
			duplicateNode: "Duplicate node",
			connectNodes: "Connect to set the next node"
		  },
		  messages: {
			deleteNode: "Are you sure you want to delete this node?",
			connectionRemoved: "Connection removed",
			connectionAdded: "Connection added",
			nodeAdded: "Node added",
			nodeRemoved: "Node removed",
			invalidConnection: "Invalid connection",
			maxConnectionsReached: "Maximum number of connections reached",
			noContent: "No content",
			noImage: "No image",
			uploaded: "loaded",
			unsupportedType: "Unsupported message type",
			noConditions: "No condition set"
		  },
		  messageTypes: {
			text: "Text",
			image: "Image",
			audio: "Audio",
			video: "Video",
			document: "Document",
			location: "Location",
			unknown: "Unknown type"
		  },
		  actions: {
			duplicate: "Duplicate",
			deleteEdge: "Remove connection",
			edit: "Edit",
			delete: "Delete",
			transferVariables: "Transfer variables"
		  },
		  execution: {
			testMode: "Test mode",
			startedAt: "Started at",
			status: {
			  active: "Running",
			  completed: "Completed",
			  error: "Error",
			  waitingInput: "Waiting for response"
			}
		  },
		  inputTypes: {
			text: "Text",
			number: "Number",
			email: "Email",
			phone: "Phone",
			cpf: "CPF",
			cnpj: "CNPJ",
			media: "Media",
			options: "Options",
			undefined: "Undefined"
		  },
		  validationTypes: {
			none: "No validation",
			email: "Email validation",
			cpf: "CPF validation",
			cnpj: "CNPJ validation",
			regex: "Regular Expression"
		  },
		  modes: {
			automatic: "Automatic",
			manual: "Manual"
		  },
		  units: {
			seconds: "seconds"
		  }
		},
		showTicketOpenModal: {
		  title: {
			header: "Ongoing Assistance"
		  },
		  form: {
			message: "This contact is already being assisted",
			user: "Attendant",
			queue: "Sector",
			messageWait: "Please wait, you will be transferred"
		  },
		  buttons: {
			close: "Close"
		  }
		},
		adminDashboard: {
		  title: "Administrative Dashboard",
		  loadingMessage: "Loading dashboard data...",
		  fetchError: "Error loading data. Please try again.",
		  updatingMessage: "Updating data...",
		  lastUpdate: "Last update: {{time}}",
		  refreshTooltip: "Update data",
		  timeRanges: {
			last7days: "Last 7 days",
			last30days: "Last 30 days",
			last90days: "Last 90 days"
		  },
		  tabs: {
			overview: "Overview",
			financial: "Financial",
			system: "System"
		  },
		  metrics: {
			activeCompanies: "Active Companies",
			total: "total",
			activeUsers: "Active Users",
			lastMonth: "last month",
			monthlyRevenue: "Monthly Revenue",
			avgResponseTime: "Average Response Time",
			pending: "pending"
		  },
		  contactMap: {
			title: "Geographical Distribution",
			loading: "Loading map...",
			totalContacts: "Total Contacts",
			noContacts: "No contacts",
			concentration: "Concentration",
			info: "View of contact distribution by state"
		  },
		  qualityMetrics: {
			title: "Quality Metrics",
			info: "Service Quality Indicators",
			fcr: {
			  title: "First Contact Resolution",
			  subtitle: "Total resolved: {{total}}",
			  trend: "FCR Trend"
			},
			directResolution: {
			  title: "Direct Resolution",
			  subtitle: "Total direct: {{total}}",
			  trend: "Direct Resolution Trend"
			},
			chartHelp: "The chart shows the evolution of quality metrics over time"
		  },
		  messaging: {
			title: "Message Metrics",
			lastUpdate: "Last update",
			info: "Message Metrics Information",
			totalMessages: "Total Messages",
			sent: "Sent",
			received: "Received",
			averageResponseTime: "Average Response Time",
			engagementRate: "Engagement Rate",
			growth: "Growth",
			activeUsers: "Active Users",
			avgMessagesPerUser: "Average Messages per User",
			peakHour: "Peak Time",
			messages: "messages",
			responseTime: "Response Time",
			failureRate: "Failure Rate",
			disconnections: "Disconnections Today"
		  },
		  whatsapp: {
			title: "WhatsApp Status",
			info: "WhatsApp Connections Monitoring",
			activeConnections: "Active Connections",
			status: {
			  connected: "Connected",
			  disconnected: "Disconnected",
			  connecting: "Connecting"
			},
			deliveryRate: "Delivery Rate",
			messages: "Messages",
			responseTime: "Response Time",
			failureRate: "Failure Rate",
			disconnections: "Disconnections"
		  },
		  performance: {
			title: "System Performance",
			info: "Performance and Resources Metrics",
			cpuUsage: "CPU Usage",
			memoryUsage: "Memory Usage",
			networkUsage: "Network Usage",
			cpuCores: "CPU Cores",
			totalMemory: "Total Memory",
			statusChecks: "Checks",
			services: {
			  database: "Database",
			  cache: "Cache",
			  network: "Network"
			},
			alerts: "Alerts",
			healthy: "Healthy System",
			issues: "Issues Detected",
			avgResponseTime: "Average Response Time",
			requestsPerSecond: "Requests/s",
			errorRate: "Error Rate",
			systemInfo: "System Information"
		  },
		  financialMetrics: {
			title: "Financial Metrics",
			info: "Financial Indicators and Revenue",
			monthlyRevenue: "Monthly Revenue",
			revenue: "Revenue",
			planDistribution: "Plan Distribution",
			defaultRate: "Default Rate",
			projection: "Revenue Projection",
			projectedRevenue: "Projected Revenue",
			actualRevenue: "Actual Revenue"
		  },
		  engagementMetrics: {
			title: "Engagement Metrics",
			info: "Interaction and Engagement Metrics",
			messagesPerDay: "Messages/Day",
			campaignSuccess: "Campaign Success",
			activeContacts: "Active Contacts",
			deliveryRate: "Delivery Rate"
		  },
		  campaignMetrics: {
			title: "Campaign Metrics",
			successRate: "Success Rate",
			active: "Active",
			completed: "Completed",
			pending: "Pending",
			failed: "Failures",
			sent: "Sent",
			delivered: "Delivered",
			info: "Analysis of message campaigns",
			status: {
			  active: "Active Campaigns",
			  completed: "Completed Campaigns",
			  pending: "Pending Campaigns",
			  failed: "Failed Campaigns"
			},
			totalContacts: "Total Contacts",
			deliveryRate: "Delivery Rate",
			engagementRate: "Engagement Rate",
			performance: "Performance Chart",
			byType: "Distribution by Type"
		  }
		},
		queueHelpModal: {
		  title: "Help - Sector Options",
		  helpButtonTooltip: "Open help about sector options",
		  tabs: {
			overview: "Overview",
			optionTypes: "Types of Options",
			advanced: "Advanced Features",
			examples: "Examples"
		  },
		  overview: {
			subtitle: "What are Sector Options?",
			description: "Sector Options allow you to create interactive flows of automated customer service. With them, you can set up service menus, collect customer information, apply validations, transfer conversations, and much more.",
			commonUseCases: "Common Use Cases",
			useCase1: "Service Menu",
			useCase1Desc: "Create interactive menus to direct customers to the correct sector",
			useCase2: "Automatic Transfer",
			useCase2Desc: "Transfer conversations to queues, users, or other numbers as needed",
			useCase3: "Data Collection",
			useCase3Desc: "Collect and validate customer information before human assistance",
			structureTitle: "Options Structure",
			structureDesc: "Sector options are organized in a hierarchical structure:",
			structure1: "Stages",
			structure1Desc: "Each level represents a stage of the service flow",
			structure2: "Messages",
			structure2Desc: "Each stage can contain a message and response options",
			structure3: "Testing and Preview",
			structure3Desc: "You can test the flow using the playback button"
		  },
		  optionTypes: {
			subtitle: "Available Types of Options",
			description: "There are several types of options that can be used for different purposes:",
			textDescription: "Send a simple text message to the customer.",
			textUseWhen: "Use for informative messages, requests, or instructions.",
			audioDescription: "Send an audio file to the customer.",
			audioUseWhen: "Use for voice messages, audio instructions, or personalized greetings.",
			videoDescription: "Send a video file to the customer.",
			videoUseWhen: "Use for tutorials, product demonstrations, or presentations.",
			imageDescription: "Send an image to the customer.",
			imageUseWhen: "Use to display products, catalogs, visual instructions, or any graphic content.",
			documentDescription: "Send a document to the customer (PDF, DOCX, etc).",
			documentUseWhen: "Use to send manuals, contracts, forms, or any formal document.",
			contactDescription: "Send a contact card to the customer.",
			contactUseWhen: "Use to share important contacts, such as technical support, sales, or other departments.",
			transferTitle: "Transfer Options",
			transferDescription: "Allow transferring the conversation to different destinations:",
			transferQueueDesc: "Transfer the conversation to another service department",
			transferUserDesc: "Transfer the conversation to a specific attendant",
			transferWhatsappDesc: "Transfer the conversation to another WhatsApp number from your account",
			transferUseWhen: "Use when you need to direct the customer to the most suitable department or attendant.",
			validationDescription: "Validates the information provided by the customer according to predefined rules.",
			validationUseWhen: "Use to collect and validate data such as CPF, email, phone number, or custom information.",
			validationCPFDesc: "Validates if the CPF format is correct and if it is a valid CPF",
			validationEmailDesc: "Validates if the email format is correct",
			validationPhoneTitle: "Phone",
			validationPhoneDesc: "Validates if the phone number format is correct",
			validationCustomTitle: "Custom",
			validationCustomDesc: "Allows creating custom validations using regular expressions (regex)",
			conditionalDescription: "Analyzes the customer's response and directs to different options based on conditions.",
			conditionalUseWhen: "Use to create dynamic flows that adapt to customer responses.",
			conditionalOperators: "Available Operators",
			operatorEqualsDesc: "Checks if the response is exactly equal to the specified value",
			operatorContainsDesc: "Checks if the response contains the specified value",
			operatorStartsWithDesc: "Checks if the response starts with the specified value",
			operatorEndsWithDesc: "Checks if the response ends with the specified value",
			operatorRegexDesc: "Checks if the response matches the specified regex pattern"
		  },
		  advanced: {
			subtitle: "Advanced Features",
			description: "Explore advanced features to create more sophisticated service flows:",
			nestingTitle: "Nested Structure",
			nestingDesc: "It is possible to create nested structures to organize the service flow in hierarchical levels.",
			nestingExample: "Example of nested structure",
			variablesTitle: "Variables in Message",
			variablesDesc: "Use variables to personalize messages with contact, department, or company information.",
			variablesExample: "Example of variable usage",
			variablesSample: "Hello {{contact.name}}, welcome to {{queue.name}}!",
			flowControlTitle: "Flow Control",
			flowControlDesc: "Combine conditional options and validations to create dynamic service flows.",
			conditionalExample: "Example of conditional flow",
			conditionalStep1: "Set an initial question (e.g., 'How can I help?')",
			conditionalStep2: "Add an option of type 'conditional'",
			conditionalStep3: "Set conditions based on keywords (e.g., 'support', 'purchase')",
			conditionalStep4: "Set different destinations for each condition",
			previewTitle: "Preview and Test",
			previewDesc: "Use the preview feature to test how messages will appear to the customer.",
			previewSteps: "How to use the preview feature"
		  },
		  examples: {
			subtitle: "Practical Examples",
			description: "See examples of common configurations to inspire your service flows:",
			menuTitle: "Service Menu",
			menuDescription: "A basic service menu that directs the customer to different departments.",
			menuExample: "Menu Example",
			menuText: "Welcome to our service!\n\nSelect an option by typing the corresponding number\n1️⃣ Technical Support\n2️⃣ Financial\n3️⃣ Sales\nOr type 'attendant' to speak with one of our collaborators.",
			menuStep1: "Set up the welcome message with options",
			menuStep2: "Set up specific technical support message",
			menuStep3: "Set up transfer to the financial department",
			menuStep4: "Set up transfer to a sales attendant",
			formTitle: "Data Collection",
			formDescription: "A form to collect and validate customer information before service.",
			formExample: "Data Collection Example",
			formText: "To proceed with your service, we need some information\n\nPlease provide your full name:",
			formStep1: "Set up the initial message requesting data",
			formStep2: "Set up validation for the name (not empty)",
			formStep3: "Set up email validation",
			formStep4: "Set up CPF validation",
			formStep5: "Set up completion and transfer message",
			conditionalTitle: "Conditional Service",
			conditionalDescription: "A flow that directs the customer based on keywords in the response.",
			conditionalExample: "Example of conditional flow",
			conditionalText: "How can I help you today? Please briefly describe your need.",
			conditionalStep1: "Set up the initial question",
			conditionalStep2: "Set up conditional response analysis",
			conditionalCondition1: "If it contains 'issue' or 'not working'",
			conditionalTarget1: "Direct to Technical Support option",
			conditionalCondition2: "If it contains 'buy' or 'price'",
			conditionalTarget2: "Direct to Sales option",
			conditionalDefault: "Default option for other responses",
			conditionalTarget3: "Direct to General Service",
			implementation: "Implementation"
		  },
		  common: {
			useWhen: "When to use",
			availableTypes: "Available types"
		  }
		},
		groups: {
		  title: "Groups",
		  createNewGroup: "Create New Group",
		  joinGroup: "Join a Group",
		  groupInfo: "Group Information",
		  groupDeleted: "Group successfully deleted",
		  createSuccess: "Group successfully created",
		  updateSuccess: "Group successfully updated",
		  deleteConfirmTitle: "Confirm deletion",
		  deleteConfirmMessage: "Are you sure you want to delete the group {name}?",
		  groupName: "Group Name",
		  groupNamePlaceholder: "Enter the group name",
		  description: "Description",
		  settings: "Settings",
		  onlyAdminsMessage: "Only administrators can send messages",
		  onlyAdminsSettings: "Only administrators can change settings",
		  forceDelete: "Force Delete",
		  forceDeleteConfirmTitle: "Confirm Force Deletion",
		  forceDeleteConfirmMessage: "Are you sure you want to force delete the group \"{name}\"?",
		  forceDeleteWarning: "WARNING: This action will only remove the group from the system, ignoring communication errors with WhatsApp. Use only when the group has already been deleted on WhatsApp and still appears in the system.",
		  groupForceDeleted: "Group successfully force deleted.",
		  extractContacts: "Extract Group Contacts",
		  extractContactsDescription: "Enter the invitation link of a WhatsApp group to extract the contact list.",
		  groupInviteLink: "Group Invitation Link",
		  downloadExcel: "Download Contact List",
		  copyDownloadLink: "Copy Download Link",
		  extractContactsInfo: "This feature allows you to extract contacts from public groups. The system will enter the group, extract the contacts, and generate an Excel file that you can download.",
		  importContacts: "Import Contacts to Group",
		  importContactsDescription: "Select a group and upload a CSV or Excel file containing the phone numbers you want to add.",
		  selectGroup: "Select Group",
		  selectGroupHelp: "Choose the group to which you want to import contacts.",
		  selectFile: "Select File",
		  fileFormatInfo: "The file must contain a column named 'number' with phone numbers in international format, without special characters (e.g. 5511999999999).",
		  downloadTemplate: "Download File Template",
		  template: "Model",
		  importSuccess: "Import completed: {valid} valid contact(s) imported, {invalid} invalid number(s).",
		  invalidNumbers: "Invalid Numbers",
		  importTips: "Import Tips",
		  importTip1: "Use numbers in international format (e.g. 5511999999999).",
		  importTip2: "Make sure the numbers are valid and active on WhatsApp.",
		  importTip3: "Avoid including too many numbers at once to prevent spam blocking.",
		  tabs: {
			info: "Information",
			participants: "Participants",
			inviteLink: "Invitation Link",
			list: "List",
			invites: "Invitations",
			requests: "Requests",
			extract: "Extrair Contatos",
			import: "Import Contacts"
		  },
		  addParticipants: "Add Participants",
		  addNewParticipants: "Add New Participants",
		  searchContacts: "Search contacts...",
		  selectedParticipants: "Selected Participants",
		  noParticipantsSelected: "No participant selected",
		  searchParticipants: "Search participants...",
		  selectContacts: "Select contacts",
		  participantsAdded: "Participants successfully added",
		  noParticipantsFound: "No participant found",
		  tryAnotherSearch: "Try another search or clear the search field",
		  admin: "Administrator",
		  promoteToAdmin: "Promote to Administrator",
		  demoteFromAdmin: "Remove Administrator Privileges",
		  removeParticipant: "Remove Participant",
		  participantPromoted: "Participant promoted to administrator",
		  participantDemoted: "Administrator privileges removed",
		  participantRemoved: "Participant removed from group",
		  inviteLink: "Invitation Link",
		  inviteLinkDescription: "Share this link to invite people to the group. Anyone with the link can join the group.",
		  generateInviteLink: "Generate Invitation Link",
		  copyLink: "Copy Link",
		  revokeAndGenerate: "Revoke and Generate New",
		  inviteCodeRevoked: "Invitation link revoked and new link generated",
		  linkCopied: "Link copied to clipboard",
		  pendingRequests: "Pending Requests",
		  noRequests: "No pending requests",
		  requestsDescription: "When new requests are received, they will appear here.",
		  requestedAt: "Requested on",
		  approve: "Approve",
		  reject: "Reject",
		  participantApproved: "Participant approved",
		  participantRejected: "Participant rejected",
		  requestsInfo: "Only requests for entry into groups with approval appear here.",
		  selectGroupToSeeRequests: "Select a group from the list to view pending requests",
		  searchPlaceholder: "Search groups...",
		  newGroup: "New Group",
		  noGroupsFound: "No group found",
		  createGroupsMessage: "Create a new group or join an existing group",
		  table: {
			name: "Name",
			participants: "Participants",
			createdAt: "Created at",
			actions: "Actions",
			rowsPerPage: "Lines per page",
			of: "of"
		  },
		  actions: {
			edit: "Information",
			requests: "Requests",
			delete: "Delete",
			forceDelete: "Force Deletion"
		  },
		  joinByInvite: "Join with Invitation Code",
		  joinByInviteDescription: "To join a group, you need the invitation code. Paste the code or invitation link below.",
		  joinGroupDescription: "To join a group, you need the invitation code. Paste the code or invitation link below.",
		  inviteCode: "Invitation Code or Link",
		  check: "Verify",
		  joining: "Joining...",
		  join: "Log in",
		  groupInfoFound: "Group information found! Check the details below before joining.",
		  createdBy: "Created by",
		  participants: "Participants",
		  unknown: "Unknown",
		  joinSuccess: "Successfully joined the group",
		  profilePicSuccess: "Profile picture updated successfully",
		  profilePicRemoved: "Profile picture removed successfully",
		  clickToChangePhoto: "Click to change the picture",
		  clickToAddPhoto: "Click to add a picture",
		  removeProfilePicConfirm: "Remove profile picture",
		  removeProfilePicMessage: "Are you sure you want to remove the profile picture from this group?",
		  addGroupPhoto: "Add group photo",
		  groupPhotoSelected: "Selected photo (click to change)",
		  profilePicUploadError: "Error uploading image",
		  errors: {
			titleRequired: "Group name is required",
			participantsRequired: "Add at least one participant",
			inviteCodeRequired: "Invitation code is required",
			invalidInviteCode: "Invalid invitation code",
			inviteCodeFailed: "Failed to get invitation code",
			selectParticipants: "Select at least one participant to add",
			linkRequired: "Invitation link is required",
			extractFailed: "Failed to extract contacts. Please try again later.",
			selectGroup: "Select a group",
			selectFile: "Select a file",
			invalidFileFormat: "Invalid file format. Use CSV, XLSX, or XLS.",
			importFailed: "Failed to import contacts. Check the file format and try again."
		  }
		},
		employers: {
		  title: "Company Management",
		  searchPlaceholder: "Search companies...",
		  noEmployers: "No companies found",
		  buttons: {
			add: "Add Company",
			edit: "Edit",
			delete: "Delete",
			cancel: "Cancel",
			update: "Update",
			create: "Create",
			refresh: "Update list",
			filter: "Filter"
		  },
		  table: {
			name: "Name",
			positions: "Positions",
			createdAt: "Creation Date",
			status: "Status",
			actions: "Actions",
			rowsPerPage: "Lines per page",
			positionsLabel: "positions"
		  },
		  status: {
			active: "Active",
			inactive: "Inactive"
		  },
		  modal: {
			add: "Add New Company",
			edit: "Edit Company"
		  },
		  form: {
			name: "Company Name",
			nameRequired: "Name is required"
		  },
		  confirmModal: {
			deleteTitle: "Confirm Deletion",
			deleteMessage: "Are you sure you want to delete this company?"
		  },
		  notifications: {
			created: "Company created successfully",
			updated: "Company updated successfully",
			deleted: "Company successfully deleted",
			fetchError: "Error loading companies",
			saveError: "Error saving company",
			deleteError: "Error deleting company",
			nameRequired: "Company name is required"
		  },
		  stats: {
			total: "Total Companies",
			active: "Active Companies",
			recentlyAdded: "Recently Added"
		  }
		},
		positions: {
		  title: "Position Management",
		  searchPlaceholder: "Search positions...",
		  noDataFound: "Oops, we don't have anything here.",
		  buttons: {
			add: "Add Position",
			edit: "Edit",
			delete: "Delete",
			cancel: "Cancel",
			update: "Update",
			create: "Create",
			refresh: "Update list",
			filter: "Filter"
		  },
		  table: {
			name: "Name",
			employers: "Companies",
			createdAt: "Creation Date",
			status: "Status",
			actions: "Actions",
			rowsPerPage: "Lines per page"
		  },
		  status: {
			active: "Active",
			inactive: "Inactive"
		  },
		  modal: {
			add: "Add New Position",
			edit: "Edit Position",
			employersLabel: "Companies",
			employersPlaceholder: "Select the companies"
		  },
		  form: {
			name: "Position Name",
			nameRequired: "Name is required"
		  },
		  confirmModal: {
			deleteTitle: "Confirm Deletion",
			deleteMessage: "Are you sure you want to delete this position?"
		  },
		  notifications: {
			created: "Position created successfully",
			updated: "Position updated successfully",
			deleted: "Position deleted successfully",
			fetchError: "Error loading positions",
			saveError: "Error saving position",
			deleteError: "Error deleting position",
			nameRequired: "Position name is required"
		  },
		  stats: {
			total: "Total Positions",
			active: "Active Positions",
			recentlyAdded: "Recently Added"
		  }
		},
		buttons: {
		  save: "Save",
		  cancel: "Cancel",
		  close: "Close",
		  delete: "Delete",
		  edit: "Edit",
		  add: "Add",
		  update: "Update",
		  download: "Download file",
		  confirm: "Confirm",
		  export: "Export",
		  print: "Print",
		  saving: "Saving...",
		  filter: "Filter",
		  clear: "Clear",
		  clearFilters: "Clear Filters",
		  applyFilters: "Apply Filters",
		  finish: "Finish",
		  next: "Next",
		  back: "Back",
		  processing: "Processing..."
		},
		dateTime: {
		  today: "Today",
		  clear: "Clear",
		  ok: "OK",
		  invalidDate: "Invalid date format",
		  maxDate: "Date cannot be after the maximum",
		  minDate: "Date cannot be before the minimum"
		},
		taskReports: {
		  title: "Task Reports",
		  subtitle: "Overview of task performance and statistics",
		  all: "All",
		  summary: {
			total: "Total Tasks",
			completed: "Completed Tasks",
			pending: "Pending Tasks",
			overdue: "Delayed Tasks",
			inProgress: "In Progress"
		  },
		  filters: {
			title: "Filters",
			startDate: "Start Date",
			endDate: "End Date",
			user: "User",
			status: "Status",
			group: "Group",
			all: "All",
			clearFilters: "Clear Filters"
		  },
		  status: {
			title: "Status",
			completed: "Completed",
			pending: "Pending",
			overdue: "Delayed",
			inProgress: "In Progress",
			assigned: "Assigned"
		  },
		  weeklyProgress: {
			title: "Weekly Progress",
			subtitle: "Tasks completed per day",
			noData: "No data available for the selected period"
		  },
		  userPerformance: {
			title: "Performance by User",
			subtitle: "Task comparison by user",
			assigned: "Assigned",
			completed: "Completed",
			overdue: "Overdue",
			noData: "No user found"
		  },
		  statusDistribution: {
			title: "Distribution by Status",
			subtitle: "Overview of tasks by status",
			noData: "No tasks found"
		  },
		  attachments: {
			title: "Attachments and Notes",
			subtitle: "Attachments and Notes Statistics",
			withAttachments: "With Attachments",
			withNotes: "With Notes",
			fileTypes: "File Types",
			noData: "No attachments found"
		  },
		  export: {
			title: "Export Report",
			pdf: "Export as PDF",
			excel: "Export as Excel",
			success: "Report exported successfully",
			error: "Error exporting report"
		  },
		  errors: {
			loadError: "Error loading data",
			retryButton: "Try again",
			invalidDateRange: "Invalid period",
			generic: "An error occurred. Please try again later."
		  },
		  tooltips: {
			refresh: "Update data",
			export: "Export report",
			filter: "Apply filters",
			clearFilters: "Clear filters"
		  },
		  noData: {
			title: "No data to display",
			message: "Try adjusting the filters or creating some tasks"
		  }
		},
		asaas: {
		  title: "Asaas Integration",
		  subtitle: "Set up your integration with Asaas for automatic billing",
		  configuration: "Configuration",
		  credentials: "Credentials",
		  rules: "Sending Rules",
		  preview: "Preview",
		  success: {
			saveSettings: "Settings saved successfully"
		  },
		  stats: {
			title: "Asaas Statistics",
			totalCompanies: "Total Companies",
			pendingCompanies: "Companies with Pending Invoices",
			overdueCompanies: "Companies with Overdue Invoices",
			lastUpdate: "Last update"
		  },
		  steps: {
			credentials: "Credentials",
			connection: "Connection",
			rules: "Rules",
			review: "Review"
		  },
		  stepHelper: {
			credentials: "Set up your Asaas credentials",
			connection: "Select WhatsApp connection",
			rules: "Set up sending rules",
			review: "Review your settings"
		  },
		  token: "Asaas Token",
		  tokenRequired: "Token is required",
		  tokenHelper: "Access token found in Asaas dashboard",
		  validatingToken: "Validating token...",
		  tokenConfigured: "Token configured",
		  whatsapp: "WhatsApp Connection",
		  whatsappRequired: "WhatsApp Connection is required",
		  whatsappHelper: "Select which connection will be used for sending",
		  whatsappSelected: "WhatsApp selected",
		  rule: "Rule",
		  rulesCount: "Total rules",
		  addRule: "Add Rule",
		  editRule: "Edit Rule",
		  deleteRule: "Delete Rule",
		  ruleTitle: "Sending Rule",
		  daysBeforeDue: "Days before due date",
		  days: "days",
		  message: "Message",
		  messageHelper: "Use the available variables to customize your message",
		  availableVariables: "Available variables",
		  variables: {
			name: "Customer name",
			value: "Billing amount",
			dueDate: "Due date",
			paymentLink: "Payment link"
		  },
		  defaultMessage: "Hello {name}, you have an invoice in the amount of {value} due on {dueDate}.",
		  sendBoleto: "Send Invoice/PIX",
		  sendBoletoHelp: "Send PIX QR Code and code to copy and paste",
		  qrCodeMessage: "Here is the QR Code for payment via PIX:",
		  pixCodeMessage: "PIX code to copy and paste:",
		  paymentOptions: "Payment Options",
		  executionTime: "Execution time",
		  messageInterval: "Interval between messages",
		  messageIntervalHelper: "Interval in minutes between sending each message",
		  weekdays: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday"
		  },
		  viewMode: "View mode",
		  listView: "List",
		  gridView: "Grid",
		  previewTitle: "Message Preview",
		  messagePreview: "Message preview",
		  previewBoletoMessage: "The invoice/QR Code will be attached automatically",
		  optional: "Optional",
		  save: "Save",
		  saving: "Saving...",
		  cancel: "Cancel",
		  next: "Next",
		  back: "Back",
		  finish: "Finish",
		  runNow: "Run Now",
		  processStarted: "Processing started",
		  processing: "Processing...",
		  readyToSave: "Configuration ready to be saved",
		  configurationSummary: "Configuration summary",
		  configured: "Configured",
		  notConfigured: "Not Configured",
		  savedSuccess: "Settings saved successfully",
		  deleteSuccess: "Rule deleted successfully",
		  deleteConfirm: "Are you sure you want to delete this rule?",
		  errors: {
			fetchStats: "Error fetching Asaas statistics",
			invalidDays: "Invalid number of days",
			messageRequired: "Message is required",
			invalidToken: "Invalid token",
			errorSaving: "Error saving settings",
			errorLoading: "Error loading settings",
			errorConnection: "Error testing connection",
			loadSettings: "Error loading settings",
			saveSettings: "Error saving settings",
			runProcess: "Error executing processing",
			preview: "Error loading preview"
		  },
		  noRules: "No rules configured",
		  tooltips: {
			addRule: "Add new sending rule",
			deleteRule: "Delete this rule",
			editRule: "Edit this rule",
			preview: "View message preview",
			sendBoleto: "Enable invoice/PIX sending",
			runNow: "Execute processing now",
			settings: "Integration settings",
			showVariables: "Show available variables"
		  },
		  status: {
			success: "Success",
			error: "Error",
			warning: "Attention",
			info: "Information"
		  },
		  delete: "Delete",
		  edit: "Edit",
		  add: "Add",
		  settings: {
			success: "Settings saved successfully",
			error: "Error saving settings",
			save: "Save Settings"
		  }
		},
		whatsappTemplates: {
		  title: "WhatsApp Templates",
		  fetchError: "Error fetching templates",
		  deleteSuccess: "Template deleted successfully",
		  deleteError: "Error deleting template",
		  createSuccess: "Template created successfully",
		  updateSuccess: "Template updated successfully",
		  submitError: "Error saving template",
		  deleteTitle: "Delete Template",
		  deleteMessage: "Are you sure you want to delete this template?",
		  table: {
			name: "Name",
			status: "Status",
			language: "Language",
			category: "Category",
			actions: "Actions"
		  },
		  buttons: {
			add: "New Template",
			edit: "Edit",
			delete: "Delete",
			view: "View",
			cancel: "Cancel"
		  },
		  modal: {
			addTitle: "New Template",
			editTitle: "Edit Template",
			viewTitle: "View Template"
		  },
		  form: {
			name: "Template Name",
			language: "Language",
			category: "Category",
			header: "Header",
			body: "Message Body",
			bodyHelp: "Use {{1}}, {{2}}, etc for dynamic variables",
			footer: "Footer",
			buttons: "Buttons",
			addButton: "Add Button",
			buttonType: "Button Type",
			buttonText: "Button Text"
		  },
		  preview: {
			title: "Template Preview"
		  }
		},
		campaigns: {
		  title: "Campaigns",
		  searchPlaceholder: "Search for campaigns...",
		  empty: {
			title: "No campaigns found",
			message: "You do not have any campaigns registered yet. Create a new campaign to start your mass mailings.",
			button: "Create Campaign"
		  },
		  buttons: {
			add: "New Campaign",
			edit: "Edit",
			delete: "Delete",
			report: "Report",
			stop: "Stop",
			restart: "Restart",
			upload: "Upload"
		  },
		  tabs: {
			campaigns: "Campaigns",
			contactLists: "Contact Lists",
			reports: "Reports",
			settings: "Settings",
			files: "Files"
		  },
		  table: {
			name: "Name",
			status: "Status",
			contactList: "Contact List",
			whatsapp: "WhatsApp",
			scheduledAt: "Scheduling",
			confirmation: "Confirmation",
			actions: "Actions",
			enabled: "Activated",
			disabled: "Disabled",
			noList: "No list",
			noWhatsapp: "Not defined",
			noSchedule: "Not scheduled",
			rowsPerPage: "Items per page",
			of: "of"
		  },
		  status: {
			inactive: "Inactive",
			scheduled: "Scheduled",
			inProgress: "In Progress",
			cancelled: "Canceled",
			finished: "Finished",
			unknown: "Unknown"
		  },
		  dialog: {
			new: "New Campaign",
			update: "Edit Campaign",
			readonly: "View Campaign",
			form: {
			  name: "Campaign Name",
			  confirmation: "Read Confirmation",
			  contactList: "Contact List",
			  tagList: "Tag",
			  whatsapp: "WhatsApp Connection",
			  scheduledAt: "Scheduling",
			  fileList: "File List",
			  none: "None",
			  disabled: "Disabled",
			  enabled: "Activated",
			  message1: "Message 1",
			  message2: "Message 2",
			  message3: "Message 3",
			  message4: "Message 4",
			  message5: "Message 5",
			  confirmationMessage1: "Confirmation Message 1",
			  confirmationMessage2: "Confirmation Message 2",
			  confirmationMessage3: "Confirmation Message 3",
			  confirmationMessage4: "Confirmation Message 4",
			  confirmationMessage5: "Confirmation Message 5",
			  messagePlaceholder: "Type your message...",
			  confirmationPlaceholder: "Enter confirmation message...",
			  messageHelp: "Use {name} to insert the contact's name, {number} for the number",
			  confirmationHelp: "Message sent when the contact confirms receipt"
			},
			tabs: {
			  message1: "Message 1",
			  message2: "Message 2",
			  message3: "Message 3",
			  message4: "Message 4",
			  message5: "Message 5"
			},
			buttons: {
			  add: "Add",
			  edit: "Save Changes",
			  cancel: "Cancel",
			  close: "Close",
			  restart: "Restart",
			  attach: "Attach File"
			}
		  },
		  confirmationModal: {
			deleteTitle: "Delete campaign",
			deleteMessage: "This action cannot be undone and all data related to this campaign will be lost.",
			deleteMediaTitle: "Remove attachment",
			cancelConfirmTitle: "Cancel campaign",
			cancelConfirmMessage: "Are you sure you want to cancel this campaign? This action cannot be undone.",
			restartConfirmTitle: "Restart campaign",
			restartConfirmMessage: "Are you sure you want to restart this campaign? This will send messages again to all contacts."
		  },
		  toasts: {
			success: "Campaign saved successfully!",
			deleted: "Campaign deleted successfully!",
			cancel: "Campaign canceled successfully!",
			restart: "Campaign restarted successfully!",
			fetchError: "Error fetching campaigns.",
			saveError: "Error saving campaign.",
			deleteError: "Error deleting campaign.",
			cancelError: "Error canceling campaign.",
			restartError: "Error restarting campaign.",
			campaignFetchError: "Error loading campaign data.",
			contactListsFetchError: "Error loading contact lists.",
			whatsappsFetchError: "Error loading WhatsApp connections.",
			filesFetchError: "Error loading file lists.",
			mediaDeleted: "Attachment removed successfully!",
			mediaDeleteError: "Error removing attachment.",
			mediaError: "Error uploading attachment, but the campaign was saved."
		  },
		  validation: {
			nameRequired: "Name is required",
			nameMin: "Name must have at least 2 characters",
			nameMax: "The name must have a maximum of 50 characters",
			whatsappRequired: "WhatsApp connection is mandatory",
			contactsRequired: "Select a contact list or a tag",
			messageRequired: "Fill in at least one message"
		  },
		  warning: {
			title: "Attention!",
			contactLimit: {
			  title: "Contacts Limit:",
			  description: "We recommend not to exceed 200 contacts per campaign to avoid WhatsApp blocks."
			},
			interval: {
			  title: "Message Interval:",
			  description: "Set appropriate intervals between messages to avoid WhatsApp blocks."
			},
			observation: {
			  title: "Note:",
			  description: "Use campaigns responsibly. Abusive sending can result in the blocking of your WhatsApp account."
			}
		  },
		  reports: {
			title: "Campaign Reports",
			selectCampaign: "Select a campaign",
			selectToView: "Select a campaign to view the reports",
			filters: {
			  today: "Today",
			  week: "Last week",
			  month: "Last month",
			  quarter: "Last 3 months"
			},
			stats: {
			  total: "Total Messages",
			  delivered: "Delivered",
			  read: "Read",
			  replied: "Replied"
			},
			charts: {
			  title: "Performance Analysis",
			  statusDistribution: "Distribution by Status",
			  dailyProgress: "Daily Progress",
			  messages: "Messages",
			  delivered: "Delivered",
			  read: "Read",
			  replied: "Replied"
			},
			details: {
			  title: "Campaign Details",
			  startedAt: "Started on",
			  completedAt: "Completed on",
			  status: "Status",
			  confirmation: "Confirmation",
			  notStarted: "Not started",
			  notCompleted: "Not completed"
			},
			noData: {
			  title: "No data to display",
			  message: "No information available for this campaign yet."
			},
			noChartData: "No data available for this chart",
			empty: {
			  title: "No report available",
			  message: "You need to have registered campaigns to view reports.",
			  button: "Create Campaign"
			},
			chartType: "Chart Type",
			chartTypes: {
			  line: "Line",
			  bar: "Bar",
			  pie: "Pie"
			},
			errors: {
			  title: "Error loading report",
			  fetchCampaigns: "Error fetching campaigns.",
			  fetchReportData: "Error loading report data."
			},
			status: {
			  pending: "Pending",
			  delivered: "Delivered",
			  read: "Read",
			  replied: "Replied",
			  error: "Error",
			  rejected: "Rejected",
			  canceled: "Canceled"
			}
		  }
		},
		contactListsValidation: {
		  nameRequired: "Name is required",
		  nameMin: "Name must have at least 2 characters",
		  nameMax: "Name must have a maximum of 50 characters"
		},
		contactListItems: {
		  validation: {
			nameRequired: "Name is required",
			nameMin: "Name must have at least 2 characters",
			nameMax: "The name must have a maximum of 50 characters",
			numberRequired: "The number is required",
			numberMin: "The number must have at least 8 characters",
			numberMax: "The number must have a maximum of 50 characters",
			emailInvalid: "Invalid email"
		  },
		  modal: {
			addTitle: "Add Contact",
			editTitle: "Edit Contact",
			mainInfo: "Key Information",
			name: "Name",
			number: "Number",
			email: "Email",
			numberHelp: "Format: Country Code + Area Code + Number (E.g. 5513912344321)",
			cancel: "Cancel",
			add: "Add",
			saveChanges: "Save Changes"
		  },
		  confirmationModal: {
			deleteTitle: "Delete contact",
			deleteMessage: "This action cannot be undone. The contact will be permanently removed from the list."
		  },
		  importDialog: {
			title: "Import Contacts",
			message: "Do you want to import contacts from other lists to this list?",
			confirm: "Import",
			cancel: "Cancel"
		  },
		  table: {
			name: "Name",
			number: "Number",
			email: "Email",
			status: "Status",
			actions: "Actions",
			rowsPerPage: "Items per page",
			of: "of"
		  },
		  buttons: {
			add: "Add Contact",
			import: "Import / Export",
			importFile: "Import File",
			importContacts: "Import Contacts",
			export: "Export Contacts",
			downloadTemplate: "Download Template",
			edit: "Edit",
			delete: "Delete",
			deleteSelected: "Delete Selected"
		  },
		  searchPlaceholder: "Search by name, number or email...",
		  selected: "selected contacts",
		  valid: "Valid",
		  invalid: "Invalid",
		  empty: {
			noContacts: "No contact found"
		  },
		  toasts: {
			added: "Contact added successfully!",
			updated: "Contact updated successfully!",
			deleted: "Contact deleted successfully!",
			deletedAll: "Contacts deleted successfully!",
			partialDeleteSuccess: "{success} contacts deleted successfully. {failed} could not be deleted.",
			fetchError: "Error fetching contacts.",
			saveError: "Error saving contact.",
			deleteError: "Error deleting contact.",
			importing: "Importing contacts. This may take a few minutes."
		  }
		},
		contactListManager: {
		  tooltips: {
			contacts: "View Contacts",
			import: "Import",
			downloadTemplate: "Download Template"
		  },
		  buttons: {
			contacts: "Contacts",
			import: "Import",
			downloadTemplate: "Download Template"
		  },
		  menu: {
			uploadFile: "Send File",
			importContacts: "Import from Contacts",
			exportContacts: "Export Contacts"
		  },
		  importDialog: {
			title: "Import Contacts",
			message: "Do you want to import contacts from your WhatsApp to this list?",
			cancel: "Cancel",
			confirm: "Import"
		  },
		  errors: {
			noListSelected: "No contact list selected.",
			importError: "Error importing contacts.",
			fileUploadError: "Error sending file."
		  },
		  toasts: {
			importing: "Importing contacts from WhatsApp...",
			exportSuccess: "Contacts exported successfully!",
			exportError: "Error exporting contacts.",
			fileUploadSuccess: "File imported successfully!"
		  }
		},
		campaignsConfig: {
		  title: "Campaign Settings",
		  intervalSettings: {
			title: "Interval Settings",
			messageInterval: "Message Interval",
			longerIntervalAfter: "Greater Interval After",
			greaterInterval: "Greater Interval",
			noInterval: "No Interval",
			second: "second",
			seconds: "seconds",
			notDefined: "Not defined",
			sends: "sends"
		  },
		  variables: {
			title: "Custom Variables",
			add: "Add Variable",
			shortcut: "Shortcut",
			content: "Content",
			shortcutPlaceholder: "E.g.: greeting",
			contentPlaceholder: "E.g.: Hi, how are you?",
			addButton: "Add",
			cancel: "Cancel",
			empty: "No custom variable defined."
		  },
		  saveButton: "Save Settings",
		  warning: {
			title: "Attention to Campaign Usage",
			content1: "Bulk messaging is a powerful yet sensitive feature.",
			content2: "WhatsApp may apply restrictions or blocks to your number, depending on the time settings and message volume.",
			content3: "To avoid blocks, we recommend setting more spaced out and moderate sending periods.",
			regards: "Sincerely,",
			team: "Team"
		  },
		  confirmationModal: {
			deleteTitle: "Remove Variable",
			deleteMessage: "Are you sure you want to remove this variable?"
		  },
		  toasts: {
			success: "Settings saved successfully!",
			emptyVariable: "Fill in all variable fields.",
			duplicatedVariable: "A variable with this shortcut already exists.",
			fetchError: "Error loading settings.",
			saveError: "Error saving settings."
		  }
		},
		delete: {
		  warning: "This action cannot be undone!",
		  cancel: "Cancel",
		  confirm: "Delete",
		  campaign: {
			title: "Delete Campaign",
			message: "Are you sure you want to delete this campaign?"
		  },
		  contactList: {
			title: "Delete Contact List",
			message: "Are you sure you want to delete this contact list?"
		  },
		  item: {
			title: "Delete Item",
			message: "Are you sure you want to delete this item?"
		  }
		},
		empty: {
		  title: "No data found",
		  message: "No data to display.",
		  button: "Add"
		},
		optionsPage: {
		  general: "General",
		  integrations: "Integrations",
		  advanced: "Advanced",
		  ai: "Artificial Intelligence",
		  general_params: "General Settings",
		  downloadSettings: "Maximum file size (sent and received)",
		  saveAll: "Save All",
		  successMessage: "Operation updated successfully.",
		  allSettingsSaved: "All settings were saved successfully.",
		  onlyOneCloseOptionActive: "Only one closing option can be active at a time",
		  openaiModel: "OpenAI Model",
		  openaiModelHelp: "Choose the OpenAI artificial intelligence model to use in automatic responses. Essential to ensure the quality and accuracy of automatic responses, improving service efficiency.",
		  satisfactionSurveyTitle: "Satisfaction Survey",
		  enableSatisfactionSurvey: "Enable satisfaction survey and report",
		  enableSatisfactionSurveyHelp: "Enable or disable satisfaction survey and report features in the top menu",
		  satisfactionSurveyEnabled: "Satisfaction survey enabled successfully",
		  satisfactionSurveyDisabled: "Satisfaction survey disabled successfully",
		  enableOneTicketPerConnection: "Enable use of one ticket per connection",
		  enableOneTicketPerConnectionHelp: "When activating the feature of one ticket per connection, if a customer contacts the team through different connections, a separate ticket will be generated for each. The operator will respond by default to the connection where the message was received.",
		  enableOfficialWhatsapp: "Enable Official WhatsApp API",
		  enableOfficialWhatsappHelp: "Enable or disable the use of the official WhatsApp Business API for communication. Important for companies that need an official and verified connection with WhatsApp.",
		  initialPage: "Home Page",
		  initialPageHelp: "Defines what will be the system's home page when accessed. Choose between the presentation page (home) or the direct login page.",
		  homePage: "Home Presentation Page",
		  loginPage: "Login Page",
		  enableQueueWhenCloseTicket: "Set sector when closing attendance",
		  enableQueueWhenCloseTicketHelp: "Requests the selection of a sector (Sector) when closing an attendance",
		  enableTagsWhenCloseTicket: "Set tag(s) when closing attendance",
		  enableTagsWhenCloseTicketHelp: "Requests the selection of tags when closing an attendance",
		  enableRegisterInSignup: "Enable registration on the home screen",
		  enableRegisterInSignupHelp: "Enables or disables the signup option on the home screen, allowing new users to register on the platform when they do not have an account. Controls the visibility of the signup option, crucial for managing new users' access to the platform, maintaining control over who can register.",
		  sendEmailInRegister: "Send email when registering",
		  sendEmailInRegisterHelp: "Send email using company 1",
		  downloadLimit: "Download Limit",
		  downloadLimitHelp: "Sets the maximum limit for file downloads in megabytes. Crucial to avoid system overload or misuse of infrastructure by limiting the size of transferred files.",
		  sendMessageWhenRegiter: "Send message when registering",
		  sendMessageWhenRegiterHelp: "Ao cadastrar-se, o sistema irá enviar uma mensagem de boas vindas. Essa configuração garante que, ao se registrar, uma mensagem de boas vindas será enviada, proporcionando uma comunicação clara e eficiente.",
		  enableSaveCommonContacts: "Enable saving common contacts",
		  enableSaveCommonContactsHelp: "Allows saving contacts that are not registered on WhatsApp. Ideal for keeping a complete record of all contacts, regardless of having a WhatsApp account.",
		  saveContactsEnabled: "Save common contacts enabled.",
		  saveContactsDisabled: "Save common contacts disabled.",
		  enableReasonWhenCloseTicket: "Display reason modal when resolving ticket",
		  enableReasonWhenCloseTicketHelp: "When finishing the attendance, the system will display a modal for the attendant to inform the reason for closing. This setting ensures the recording of reasons for closing attendances, providing greater control and analysis of the reasons for closure, which can help in the continuous improvement of customer service.",
		  showSKU: "Display ticket value and SKU",
		  showSKUHelp: "Configures whether the ticket value and SKU will be displayed in the attendance. Important to provide detailed financial information, optimizing decision-making during attendance.",
		  speedMessage: "Quick Messages",
		  speedMessageHelp: "Defines the use of quick messages to facilitate attendance. Increases attendants' productivity, allowing quick and standardized responses, saving time on repetitive attendances.",
		  byCompany: "By Company",
		  byUser: "By User",
		  sendanun: "Send greeting when accepting ticket",
		  sendanunHelp: "Defines whether a greeting message will be sent automatically when accepting a new ticket. Improves the customer experience by receiving an instant greeting, ensuring a more welcoming and professional interaction.",
		  sendQueuePosition: "Send message with queue position",
		  sendQueuePositionHelp: "Defines whether the system will send messages informing the customer's position in the attendance queue. Important to keep the customer informed about their estimated wait time.",
		  settingsUserRandom: "Choose random attendant",
		  settingsUserRandomHelp: "Enables or disables the random selection of attendants for new tickets. Useful for distributing workload more evenly among the team.",
		  calif: "Enable automatic evaluation",
		  califHelp: "Set the activation or deactivation of automatic evaluations of the service. Crucial to obtain continuous feedback from customers, allowing for constant improvement in service quality.",
		  expedient: "Shift Management",
		  expedientHelp: "Enable or disable schedule management for time control. Important to optimize organization and ensure that service is provided within established hours.",
		  buttons: {
			off: "Disabled",
			partner: "By Company",
			quee: "By Department"
		  },
		  ignore: "Ignore WhatsApp groups",
		  ignoreHelp: "Set whether WhatsApp groups will be ignored in service. Essential to focus service on individual interactions, avoiding distractions and overload with group conversations.",
		  typechatbot: "Chatbot Type",
		  typechatbotHelp: "Set the type of chatbot to be used, such as text or another format. Essential to personalize automatic interaction with customers, offering a more tailored experience to business needs.",
		  text: "Text",
		  list: "List",
		  button: "Buttons",
		  ticketSettings: "Service Options",
		  contactSettings: "Contact Options",
		  displayContactInfoDisabled: "This feature can only be activated if Display business data of the contact is disabled",
		  displayProfileImages: "Display the profile picture of the contact and the user on the service screen",
		  displayProfileImagesHelp: "Allows displaying or hiding the profile picture of the contact and also of the user in messages.",
		  sendagent: "Send message on transfer",
		  donwloadSettings: "Sent/Received Files Settings",
		  developmentPanels: "Developer Panels",
		  sendagentHelp: "Enable or disable sending automatic messages when transferring a service between queues or agents. Important to keep the customer informed about the change of attendants, improving transparency and user experience.",
		  greeatingOneQueue: "Send greeting message to single sector",
		  greeatingOneQueueHelp: "Set whether a greeting message will be sent automatically when the service is transferred to a single sector. Ensures that the contact receives an automatic greeting when transferred to a sector, keeping the service more personal and organized, even in queues with only one attendant.",
		  callSuport: "Enable support button",
		  callSuportHelp: "Enable or disable the function to call technical support directly through the system. Essential to solve problems quickly, offering an immediate solution to users' technical issues.",
		  displayContactInfo: "Display phone number",
		  displayContactInfoHelp: "Set whether the phone number will be displayed instead of the contact's name. Useful in situations where the customer's name may not be known, allowing for efficient organization based on the phone number.",
		  displayBusinessInfo: "Display business data of the contact",
		  displayBusinessInfoHelp: "Set whether business data (company and position) will be displayed on the service screen. Useful to personalize service based on the contact's professional profile.",
		  trialExpiration: "Days for free trial",
		  trialExpirationHelp: "Set the number of days available for the system's free trial. Crucial to attract new customers, providing a complete system experience before hiring.",
		  enableMetaPixel: "Enable Meta Pixel",
		  enableMetaPixelHelp: "Enable the use of Meta Pixel for all companies",
		  metaPixelEnabled: "Meta Pixel successfully activated",
		  metaPixelDisabled: "Meta Pixel successfully deactivated",
		  metaPixelSettings: "Meta Pixel Settings",
		  metaPixelId: "Meta Pixel ID",
		  metaPixelIdHelp: "Enter the Meta Pixel ID for conversion tracking",
		  saveMetaPixelSettings: "Save Pixel Settings",
		  enableGroupTool: "Enable Group Manager",
		  enableGroupToolHelp: "Allows the use of advanced tools for group management",
		  groupToolEnabled: "Group Manager successfully enabled",
		  groupToolDisabled: "Group Manager successfully disabled",
		  enableMessageRules: "Enable Message Rules",
		  enableMessageRulesHelp: "Allows the creation and management of rules for messages",
		  messageRulesEnabled: "Message Rules successfully enabled",
		  messageRulesDisabled: "Message Rules successfully disabled",
		  enableUPSix: "Enable integration with UPSix",
		  enableUPSixHelp: "Enable or disable integration with UPSix in the system.",
		  upsixEnabled: "Integration with UPSix enabled.",
		  upsixDisabled: "Integration with UPSix disabled.",
		  enableUPSixWebphone: "Enable UPSix webphone",
		  enableUPSixWebphoneHelp: "Enable or disable the use of the integrated UPSix webphone.",
		  enableUPSixNotifications: "Enable UPSix notifications",
		  enableUPSixNotificationsHelp: "Enable or disable notifications via UPSix.",
		  enableGLPI: "Enable integration with GLPI",
		  enableGLPIHelp: "Enable or disable the function of opening a ticket in GLPI through the ticket screen. Essential to streamline service and support, offering an immediate solution to integrate with GLPI.",
		  glpiEnabled: "Integration with GLPI enabled.",
		  glpiDisabled: "Integration with GLPI disabled.",
		  glpiApiSettings: "GLPI API settings",
		  glpiApiUrl: "GLPI API URL",
		  glpiAppToken: "App Token",
		  glpiMasterToken: "GLPI Token",
		  glpiIntegrationHelp: "With this integration, whenever a service is registered on our platform, the information can be automatically forwarded to GLPI, facilitating ticket tracking and support request resolution. Correct configuration of these parameters is essential to ensure that data exchange between systems occurs securely and efficiently.",
		  saveGlpiSettings: "Save GLPI API data",
		  glpiFieldsRequired: "Please fill in all required fields for GLPI integration before proceeding.",
		  enableOmie: "Enable integration with Omie",
		  enableOmieHelp: "Enable or disable integration with Omie in the system, allowing access to features during service. Essential to integrate financial and commercial information directly on the platform.",
		  omieEnabled: "Integration with Omie enabled.",
		  omieDisabled: "Integration with Omie disabled.",
		  omieApiSettings: "Omie API settings",
		  omieAppKey: "App Key",
		  omieAppSecret: "App Secret",
		  omieIntegrationHelp: "With this integration, it will be possible to access Omie's features directly through the platform, allowing queries and operations without the need to access the Omie system separately. Correct configuration of credentials is essential to ensure a secure and efficient integration.",
		  omieRequiredSector: "To use this integration, you need to create a sector whose name must be one of these options: 2nd Boleto, 2nd Boleto or Boleto - Billing.",
		  saveOmieSettings: "Save Omie API data",
		  omieFieldsRequired: "Please fill in all required fields for Omie integration before proceeding.",
		  enableZabbix: "Enable integration with Zabbix",
		  enableZabbixHelp: "Enable or disable integration with Zabbix for system monitoring. Important to monitor performance and service availability.",
		  zabbixEnabled: "Integration with Zabbix enabled.",
		  zabbixDisabled: "Integration with Zabbix disabled.",
		  zabbixApiSettings: "Zabbix API settings",
		  zabbixAuthToken: "Authentication Token",
		  zabbixBaseUrl: "Zabbix Base URL",
		  zabbixIntegrationHelp: "Configure Zabbix API access credentials to enable integrated monitoring. Essential to maintain control over system performance.",
		  saveZabbixSettings: "Save Zabbix settings",
		  zabbixFieldsRequired: "Please fill in all required fields for Zabbix integration before proceeding.",
		  zabbixConfigSuccess: "Zabbix settings updated successfully.",
		  whatsappApiEnabled: "Official WhatsApp API enabled.",
		  whatsappApiDisabled: "Official WhatsApp API disabled.",
		  support: "Support",
		  wasuport: "Support WhatsApp",
		  msgsuport: "Predefined message",
		  apiToken: "API Token",
		  apiTokenHelp: "Access token for integration with external API.",
		  generateToken: "Generate new token",
		  copyToken: "Copy token",
		  deleteToken: "Delete token",
		  tokenCopied: "Token copied to clipboard",
		  smtpServer: "SMTP Server",
		  smtpUser: "SMTP User",
		  smtpPassword: "SMTP Password",
		  smtpPort: "SMTP Port",
		  smtpHelp: "SMTP server settings for sending emails by the system.",
		  days: "days"
		},
		backendErrors: {
		  ERR_NO_OTHER_WHATSAPP: "There must be at least one default WhatsApp.",
		  ERR_CONNECTION_NOT_CONNECTED: "The connection linked to the ticket is not connected on the platform, please check the connections page.",
		  ERR_NO_DEF_WAPP_FOUND: "No default WhatsApp found. Please check the connections page.",
		  ERR_WAPP_NOT_INITIALIZED: "This WhatsApp session was not initialized. Please check the connections page.",
		  ERR_WAPP_CHECK_CONTACT: "Could not verify the WhatsApp contact. Please check the connections page.",
		  ERR_WAPP_INVALID_CONTACT: "This is not a valid WhatsApp number.",
		  ERR_WAPP_DOWNLOAD_MEDIA: "Could not download media from WhatsApp. Please check the connections page.",
		  ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
		  ERR_SENDING_WAPP_MSG: "Error sending WhatsApp message. Please check the connections page.",
		  ERR_DELETE_WAPP_MSG: "Could not delete the WhatsApp message.",
		  ERR_OTHER_OPEN_TICKET: "There is already an open ticket for this contact.",
		  ERR_SESSION_EXPIRED: "Session expired. Please log in.",
		  ERR_USER_CREATION_DISABLED: "User creation has been disabled by the administrator.",
		  ERR_NO_PERMISSION: "You do not have permission to access this resource.",
		  ERR_DUPLICATED_CONTACT: "There is already a contact with this number.",
		  ERR_NO_SETTING_FOUND: "No configuration found with this ID.",
		  ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
		  ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
		  ERR_NO_USER_FOUND: "No user found with this ID.",
		  ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
		  ERR_NO_TAG_FOUND: "No TAG found",
		  ERR_CREATING_MESSAGE: "Error creating message in the database.",
		  ERR_CREATING_TICKET: "Error creating ticket in the database.",
		  ERR_FETCH_WAPP_MSG: "Error fetching the message on WhatsApp, it may be too old.",
		  ERR_QUEUE_COLOR_ALREADY_EXISTS: "This color is already in use, please choose another one.",
		  ERR_WAPP_GREETING_REQUIRED: "The greeting message is mandatory when there is more than one department.",
		  ERR_NO_USER_DELETE: "It is not possible to delete Super user",
		  ERR_OUT_OF_HOURS: "Out of Office Hours!",
		  ERR_QUICKMESSAGE_INVALID_NAME: "Invalid name",
		  ERR_EDITING_WAPP_MSG: "Could not edit the WhatsApp message",
		  ERR_CREATE_CONTACT_MSG: "Oops! There was an error creating the contact, refresh the page and try again, if the problem persists contact technical support.",
		  ERR_ACCESS_ANOTHER_COMPANY: "It is not possible to access records from another company",
		  ERR_THE_NUMBER: "O número",
		  ERR_THE_NUMBER_IS_NOT_PRESENT_WITHIN_THE_GROUP: "não está presente dentro do grupo para realizar a extração dos contatos. É necessário que o mesmo esteja dentro do grupo para realizar a ação.",
		  ERR_GENERIC: "Oops! An error occurred, refresh the page and try again, if the problem persists contact technical support.",
		  ERR_NAME_INTEGRATION_ALREADY_EXISTS: "This integration name is already in use.",
		  ERR_NAME_INTEGRATION_OPENAI_ALREADY_EXISTS: "The integration with OpenAI is already in use.",
		  ERR_NAME_INTEGRATION_MIN_2: "The name must have at least 2 characters.",
		  ERR_NAME_INTEGRATION_MAX_50: "The name must have a maximum of 50 characters.",
		  ERR_NAME_INTEGRATION_REQUIRED: "The name is mandatory.",
		  ERR_ACCESS_ANOTHER_COMPANY_INTEGRATION: "It is not possible to use integration from another company.",
		  ERR_NEED_COMPANY_ID_OR_TOKEN_DATA: "companyId or tokenData is required.",
		  ERR_ONLY_ACTIVE_USER_OR_ADMIN_CAN_EDIT_TICKET: "Only the active ticket user or Admin can make changes to the ticket.",
		  ERR_WHATSAPP_LINK_ERROR: "An error occurred while trying to locate the WhatsApp associated with the user.",
		  ERR_WHATSAPP_DEFAULT_NOT_FOUND: "Default WhatsApp not found.",
		  ERR_WBOT_NOT_FOUND: "Wbot not found.",
		  ERR_SMTP_URL_NOT_FOUND: "SMTP URL configuration not found.",
		  ERR_SMTP_USER_NOT_FOUND: "SMTP user configuration not found.",
		  ERR_SMTP_PASSWORD_NOT_FOUND: "SMTP password configuration not found.",
		  ERR_SMTP_PORT_NOT_FOUND: "SMTP port configuration not found.",
		  ERR_EMAIL_SENDING: "Oops! There was an error sending the email.",
		  ERR_WHATSAPP_NOT_FOUND: "Could not find the WhatsApp linked to the user.",
		  ERR_CONTACT_HAS_OPEN_TICKET: "There is already an open service for this contact.",
		  ERR_TICKET_NOT_FOUND: "Ticket not found.",
		  ERR_SKU_REQUIRED: "SKU is mandatory.",
		  ERR_SKU_VALUE_REQUIRED: "SKU value is mandatory.",
		  ERR_INVALID_TICKET_ID: "Invalid ticket ID provided.",
		  ERR_WORK_HOURS_UNDEFINED: "Business hours have not been set.",
		  ERR_AUTHENTICATION_DATA_SEND_GLPI_ERROR: "An error occurred while trying to send authentication data to GLPI.",
		  ERR_INVALID_URL: "The provided URL is invalid! Please check if the authentication data is correct on the system settings screen and try again.",
		  ERR_INTERNAL_SERVER_ERROR: "An internal server error occurred.",
		  ERR_CONNECTION_NOT_PROVIDED: "Connection not informed.",
		  ERR_INVALID_NUMBER_FORMAT: "Invalid number format. Only numbers are allowed.",
		  ERR_QUICKMESSAGE_MIN_3_CARACTERES: "The message must have at least 3 characters.",
		  ERR_SHORTCUT_MIN_3_CHARACTERS: "The shortcut must have at least 3 characters.",
		  ERR_NO_FILE_UPLOADED_QUICK_MESSAGE: "No file was sent.",
		  ERR_QUICK_MESSAGE_NOT_FOUND: "Quick message not found.",
		  ERR_UNAUTHENTICATED_OR_UNIDENTIFIED_COMPANY: "User not authenticated or company not identified.",
		  ERR_SHORTCODE_REQUIRED: "Shortcut is mandatory.",
		  ERR_MESSAGE_REQUIRED: "Message is mandatory.",
		  ERR_QUICKMESSAGE_REQUIRED: "Quick response is mandatory.",
		  ERR_FILE_EXTENSION_NOT_ALLOWED: "File type not allowed on the platform. Please try another file type."
		}
	  }
	}
  };
  
  export { messages };