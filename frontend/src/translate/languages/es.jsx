const messages = {
	es: {
		translations: {
			companySelector: {
				selectCompany: "Acceder como administrador...",
				accessingAs: "Accediendo como administrador de la empresa",
				returnToSuperAdmin: "Volver a la cuenta principal",
				returnedToSuperAdmin: "Vuelto a la cuenta de super administrador"
			},
			whitelabel: {
				titles: {
					generalSettings: "Configuraciones Generales",
					colorSettings: "Configuraciones de Colores",
					logosAndBackgrounds: "Logos, Iconos e Imágenes de Fondo"
				},
				labels: {
					systemName: "Nombre del sistema",
					copyright: "Derechos de autor",
					privacyPolicy: "Enlace de Política de Privacidad",
					terms: "Enlace de Términos de uso",
					chooseColor: "Elija el color a cambiar"
				},
				colors: {
					primaryColorLight: "Color Primario Modo Claro",
					secondaryColorLight: "Color Secundario Modo Claro",
					primaryColorDark: "Color Primario Modo Oscuro",
					secondaryColorDark: "Color Secundario Modo Oscuro",
					iconColorLight: "Color del Icono Modo Claro",
					iconColorDark: "Color del Icono Modo Oscuro",
					chatlistLight: "Fondo Chat Interno Modo Claro",
					chatlistDark: "Fondo Chat Interno Modo Oscuro",
					boxLeftLight: "Mensajes de Otros Modo Claro",
					boxLeftDark: "Mensajes de Otros Modo Oscuro",
					boxRightLight: "Mensajes del Usuario Modo Claro",
					boxRightDark: "Mensajes del Usuario Modo Oscuro"
				},
				images: {
					appLogoLight: "Logotipo para tema claro",
					appLogoDark: "Logotipo para tema oscuro",
					appLogoFavicon: "Ícono del FavIcon",
					appLogoPWAIcon: "Ícono del PWA",
					loginBackground: "Imagen de fondo para pantalla de inicio de sesión",
					signupBackground: "Imagen de fondo para pantalla de registro"
				},
				success: {
					settingUpdated: "Configuración actualizada con éxito",
					backgroundUpdated: "Imagen de fondo actualizada con éxito",
					backgroundDeleted: "Imagen de fondo eliminada con éxito",
					logoUpdated: "Logotipo actualizado con éxito"
				},
				errors: {
					settingUpdateFailed: "Error al actualizar configuración",
					backgroundUploadFailed: "Error al cargar la imagen de fondo",
					backgroundDeleteFailed: "Error al eliminar la imagen de fondo",
					logoUploadFailed: "Error al cargar el logotipo"
				}
			},
			company: {
				delete: "Eliminar",
				save: "Guardar",
				cancel: "Cancelar",
				user: "Usuario",
				monthly: "Mensual",
				bimonthly: "Bimestral",
				quarterly: "Trimestral",
				semiannual: "Semestral",
				annual: "Anual",
				recurrence: "Recurrencia",
				enabled: "Habilitadas",
				disabled: "Deshabilitadas",
				campaigns: "Campañas",
				active: "Activo",
				inactive: "Inactivo",
				status: "Estado",
				plan: "Plan"
			},
			ticket: {
				notifications: {
					notificationWarningMessageUser: "Este ticket no se puede reabrir porque no tiene una conexión vinculada. El ticket se cerró porque la conexión fue eliminada."
				},
				buttons: {
					cancel: "Cancelar",
					confirm: "Confirmar",
					refresh: "Actualizar el listado de atenciones"
				},
				emailPdf: {
					title: "Enviar Atención por Correo Electrónico",
					emailLabel: "Correo Electrónico del Destinatario",
					subjectLabel: "Asunto",
					messageLabel: "Mensaje",
					sendButton: "Enviar",
					cancelButton: "Cancelar",
					success: "¡Correo electrónico enviado con éxito!",
					error: "Error al enviar el correo electrónico. Inténtelo de nuevo.",
					missingInfo: "Complete todos los campos obligatorios."
				},
				pdfExport: {
					generating: "Generando PDF...",
					elementsNotFound: "No se pudo encontrar el contenido de la atención",
					fileTooLarge: "El archivo PDF generado es muy grande. Máximo de 10MB.",
					generationError: "Error al generar PDF. Inténtelo de nuevo."
				},
				menuItem: {
					sku: "Definir Valor y SKU del Ticket",
					transfer: "Transferir Atención",
					schedule: "Programación",
					deleteTicket: "Eliminar Ticket",
					createTask: "Crear Tarea"
				},
				queueModal: {
					title: "Seleccione el sector",
					queue: "Sector"
				},
				tagModal: {
					title: "Seleccione las etiquetas",
					select: "Etiquetas",
					placeholder: "Seleccione una o más etiquetas"
				},
				vcard: {
					buttonSave: "Guardar",
					buttonConversation: "Chatear"
				},
				toasts: {
					savedContactSuccess: "Contacto guardado con éxito."
				},
				sku: {
					skuValue: "Valor del Ticket",
					skuCode: "Código SKU",
					updatedTicketValueSuccessSku: "¡Valor actualizado con éxito!"
				},
				actionButtons: {
					exportPDF: "Exportar a PDF",
					close: "Cerrar"
				},
				noMessagesSelected: "Ningún mensaje seleccionado"
			},
			genericError: "¡Ups! Se produjo un error, actualiza la página e inténtalo de nuevo. Si el problema persiste, ponte en contacto con soporte técnico.",
			signup: {
				title: "Crear Cuenta",
				unavailable: "Registro no disponible en este momento",
				steps: {
					person: "Datos Personales",
					company: "Datos de la Empresa",
					address: "Dirección",
					access: "Acceso"
				},
				form: {
					personType: "Tipo de Persona",
					personTypes: {
						physical: "Persona Física",
						legal: "Persona Jurídica"
					},
					cpf: "CPF",
					cnpj: "CNPJ",
					fullName: "Nombre Completo",
					razaoSocial: "Razón Social",
					email: "Correo Electrónico",
					phone: "Teléfono",
					password: "Contraseña",
					cep: "Código Postal",
					estado: "Estado",
					cidade: "Ciudad",
					bairro: "Barrio",
					logradouro: "Calle",
					numero: "Número",
					noNumber: "Sin número",
					plan: "Plan",
					users: "Usuarios",
					queues: "Departamentos",
					loading: "Cargando...",
					acceptTerms: "He leído y acepto los",
					terms: "Términos de Uso",
					and: "e",
					privacy: "Política de Privacidad"
				},
				validation: {
					required: "Campo obligatorio",
					emailExists: "Este correo electrónico ya está en uso",
					phoneExists: "Este teléfono ya está en uso",
					invalidDocument: "Documento inválido",
					terms: "Debes aceptar los términos de uso",
					password: {
						requirements: "Requisitos de la contraseña",
						length: "Mínimo de 8 caracteres",
						lowercase: "Al menos una letra minúscula",
						uppercase: "Al menos una letra mayúscula",
						number: "Al menos un número",
						special: "Al menos un carácter especial (@$!%*?&)"
					}
				},
				passwordStrength: {
					weak: "Contraseña débil",
					medium: "Contraseña media",
					strong: "Contraseña fuerte"
				},
				buttons: {
					next: "Siguiente",
					back: "Volver",
					submit: "Registrar",
					login: "Iniciar sesión",
					loginText: "¿Ya tienes una cuenta?"
				},
				toasts: {
					success: "¡Registro realizado con éxito!",
					error: "Error al realizar el registro",
					errorPassword: "Error al validar la contraseña",
					errorPlan: "Error al seleccionar el plan",
					errorFields: "Error al validar campos",
					errorDocument: "Error al validar documento",
					errorAddress: "Error al buscar dirección",
					errorEmail: "Error al validar correo electrónico",
					errorPhone: "Error al validar teléfono"
				}
			},
			forgotPassword: {
				title: "Olvidé mi contraseña",
				resetTitle: "Restablecer contraseña",
				email: "Correo Electrónico",
				token: "Código de verificación",
				newPassword: "Nueva contraseña",
				confirmPassword: "Confirma la nueva contraseña",
				sendEmail: "Enviar correo electrónico",
				resetPassword: "Restablecer contraseña",
				cancel: "Cancelar",
				invalidEmail: "Correo electrónico inválido",
				requiredEmail: "El correo electrónico es obligatorio",
				requiredToken: "El código de verificación es obligatorio",
				invalidToken: "Código de verificación inválido",
				requiredPassword: "La nueva contraseña es obligatoria",
				minPassword: "La contraseña debe tener al menos 8 caracteres",
				passwordRequirements: "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número",
				passwordMatch: "Las contraseñas no coinciden",
				requiredConfirmPassword: "La confirmación de contraseña es obligatoria",
				emailSent: "¡Correo electrónico enviado con éxito! Verifica tu bandeja de entrada",
				emailError: "Error al enviar el correo electrónico. Inténtalo de nuevo",
				resetSuccess: "¡Contraseña restablecida con éxito!",
				resetError: "Error al restablecer la contraseña. Inténtalo de nuevo",
				sendEmailTooltip: "Enviar correo electrónico con código de verificación",
				resetPasswordTooltip: "Confirmar nueva contraseña"
			},
			reports: {
				title: "Informes de Atención",
				description: "Visualiza y analiza datos de atención realizados en tu empresa.",
				filters: {
					title: "Filtros",
					startDate: "Fecha Inicial",
					endDate: "Fecha Final",
					status: "Estado",
					user: "Atendente",
					queues: "Sector",
					queue: "Sector",
					allQueue: "Todos los Sectores",
					tags: "Etiquetas",
					search: "Buscar",
					period: "Período",
					filterBy: "Filtrar por",
					employer: "Empresa",
					allEmployers: "Todas las empresas",
					clearFilters: "Limpiar Filtros",
					allStatus: "Todos los Estados",
					statusOpen: "Abierto",
					statusPending: "Pendiente",
					statusClosed: "Cerrado",
					allUsers: "Todos los Agentes"
				},
				tabs: {
					data: "Datos",
					export: "Exportar",
					charts: "Gráficos",
					exportCsv: "Exportar CSV"
				},
				table: {
					columns: {
						id: "ID",
						contact: "Contacto",
						queue: "Sector",
						user: "Atendente",
						status: "Estado",
						createdAt: "Creado en",
						updatedAt: "Actualizado en",
						tags: "Etiquetas"
					},
					noData: "No se encontraron datos para los filtros seleccionados.",
					rowsPerPage: "Filas por página:",
					of: "de",
					unknown: "Desconocido"
				},
				status: {
					open: "Abierto",
					pending: "Pendiente",
					closed: "Cerrado"
				},
				export: {
					preview: "Vista Previa",
					previewNote: "Mostrando {shown} de {total} registros",
					summary: "Resumen",
					totalTickets: "Total de Atenciones",
					totalMessages: "Total de Mensajes",
					avgMessagesPerTicket: "Promedio de Mensajes por Atención",
					avgAttendanceTime: "Tiempo Promedio de Atención",
					statusDistribution: "Distribución por Estado",
					reportTitle: "Informe de Atenciones",
					periodLabel: "Período",
					options: "Opciones de Exportación",
					includeLogo: "Incluir Logo de la Empresa",
					exportPdf: "Exportar PDF",
					generating: "Generando...",
					success: "¡Informe exportado con éxito!",
					error: "Error al exportar el informe. Inténtalo de nuevo.",
					logoPlaceholder: "Logo de la empresa (se incluirá en el PDF)"
				},
				exportCsv: {
					title: "Exportación a CSV",
					description: "Exporte los tickets filtrados a un archivo CSV que puede abrirse en Excel u otros programas de hojas de cálculo.",
					filePreview: "Vista Previa del Archivo CSV",
					preview: "VISTA PREVIA",
					generating: "Generando CSV...",
					filters: "Filtros",
					exportButton: "Exportar CSV",
					fileStructure: "Estructura del archivo de retorno",
					success: "CSV generado con éxito. La descarga comenzará automáticamente.",
					errorCsv: "Error al generar el archivo CSV. Inténtalo de nuevo.",
					noDataToExport: "No hay datos para exportar con los filtros seleccionados.",
					infoMessage: "El archivo CSV incluirá todos los tickets que corresponden a los filtros aplicados. Los datos se exportarán en formato de tabla con encabezados.",
					instructions: "Instrucciones de Uso",
					instruction1: "El archivo CSV generado se puede importar en programas como Microsoft Excel, Google Sheets o LibreOffice Calc.",
					instruction2: "Para abrir en Excel, simplemente haga doble clic en el archivo descargado o use la opción 'Abrir' en Excel y busque el archivo.",
					instruction3: "Si los caracteres especiales no se muestran correctamente, elija la opción UTF-8 al abrir el archivo."
				},
				charts: {
					title: "Análisis Gráfico",
					daily: "Diario",
					weekly: "Semanal",
					monthly: "Mensual",
					ticketsByQueue: "Atenciones por Sector",
					ticketsByStatus: "Atenciones por Estado",
					ticketsTrend: "Tendencia de Atenciones",
					tickets: "Atenciones",
					topUsers: "Mejores Agentes",
					topQueues: "Mejores Sectores",
					noData: "No hay datos disponibles para el período seleccionado."
				},
				errors: {
					loadFailed: "Error al cargar los datos. Inténtalo de nuevo.",
					chartLoadFailed: "Error al cargar los gráficos. Inténtalo de nuevo.",
					summaryLoadFailed: "Error al cargar el resumen. Inténtalo de nuevo."
				}
			},
			queueModal: {
				title: {
					add: "Agregar Sector",
					edit: "Editar Sector",
					delete: "Eliminar Sector"
				},
				confirmationModal: {
					deleteTitle: "Eliminar",
					deleteMessage: "¿Estás seguro? ¡Esta acción no se puede deshacer! y se eliminará de los sectores y conexiones relacionadas"
				},
				serviceHours: {
					sunday: "domingo",
					monday: "lunes",
					tuesday: "martes",
					wednesday: "miércoles",
					thursday: "jueves",
					friday: "viernes",
					saturday: "sábado"
				},
				form: {
					name: "Nombre",
					newTicketOnTransfer: "Crear nuevo ticket al transferir",
					color: "Color",
					keywords: "Palabras clave para transferencia",
					greetingMessage: "Mensaje de saludo",
					complationMessage: "Mensaje de conclusión",
					outOfHoursMessage: "Mensaje fuera de horario laboral",
					ratingMessage: "Mensaje de evaluación",
					token: "Token",
					orderQueue: "Orden del Sector (Bot)",
					integrationId: "Integración",
					closeTicket: "Cerrar ticket",
					tags: "Etiquetas (Kanban)"
				},
				buttons: {
					okAdd: "Agregar",
					okEdit: "Guardar",
					cancel: "Cancelar",
					attach: "Adjuntar Archivo"
				},
				toasts: {
					deleted: "Sector eliminado con éxito.",
					inserted: "Sector creado con éxito.",
					tagsError: "Error al buscar etiquetas"
				},
				tabs: {
					queue: "Sector",
					schedules: "Horarios"
				}
			},
			queueOptions: {
				title: "Título",
				addChild: "Agregar Sub-opción",
				editing: "Editando Opción",
				add: "Agregar Opción",
				optionType: "Tipo de Opción",
				message: "Mensaje",
				noMessage: "Sin mensaje",
				save: "Guardar",
				delete: "Eliminar",
				preview: {
					title: "Vista previa de la Opción",
					mediaFile: "Archivo de medios",
					contactCard: "Tarjeta de Contacto",
					transferTo: "Transferir a",
					note: "Esta es una vista previa de cómo se mostrará la opción al usuario",
					close: "Cerrar"
				},
				untitled: "Sin título",
				attachFile: "Adjuntar Archivo",
				selectedContact: "Contacto seleccionado",
				selectContact: "Seleccionar Contacto",
				changeContact: "Cambiar Contacto",
				targetQueue: "Sector de Destino",
				selectQueue: "Seleccione un sector",
				targetUser: "Atendente de Destino",
				selectUser: "Seleccione un Atendente",
				targetWhatsapp: "Conexión de Destino",
				selectWhatsapp: "Seleccione una Conexión",
				validationType: "Tipo de Validación",
				selectValidationType: "Seleccione un Tipo de Validación",
				validationRegex: "Expresión Regular",
				validationRegexPlaceholder: "Ej: ^[0-9]{11}$",
				validationRegexHelp: "Expresión regular para validar la entrada del usuario",
				validationErrorMessage: "Mensaje de Error",
				validationErrorMessagePlaceholder: "Por favor, ingrese un valor válido",
				conditionalLogicTitle: "Lógica Condicional",
				conditionalLogicDescription: "Configure condiciones para dirigir al usuario a diferentes opciones",
				conditionalVariable: "Variable Condicional",
				selectConditionalVariable: "Seleccione una Variable",
				conditions: "Condiciones",
				operator: "Operador",
				value: "Valor",
				targetOption: "Opción de Destino",
				selectTargetOption: "Seleccione una Opción",
				addCondition: "Agregar Condición",
				defaultOption: "Opción por Defecto",
				defaultOptionDescription: "Opción que se seleccionará si no se cumple ninguna condición",
				noDefaultOption: "Sin opción por defecto",
				optionTypes: {
					text: "Texto",
					audio: "Audio",
					video: "Video",
					image: "Imagen",
					document: "Documento",
					contact: "Contacto",
					transferQueue: "Transferir a Sector",
					transferUser: "Transferir a Atendente",
					transferWhatsapp: "Transferir a Conexión",
					validation: "Validación",
					conditional: "Condicional"
				},
				validationTypes: {
					cpf: "CPF",
					email: "Correo Electrónico",
					phone: "Teléfono",
					custom: "Personalizado"
				},
				conditionalVariables: {
					lastMessage: "Último Mensaje del Usuario"
				},
				operators: {
					equals: "Igual a",
					contains: "Contiene",
					startsWith: "Comienza con",
					endsWith: "Termina con",
					regex: "Expresión Regular"
				},
				contactSearch: {
					title: "Buscar Contacto",
					searchPlaceholder: "Ingrese nombre o número",
					noResults: "No se encontraron contactos",
					startTyping: "Ingrese para buscar contactos",
					cancel: "Cancelar"
				}
			},
			login: {
				title: "Iniciar sesión",
				title2: "Iniciar sesión",
				forgotPassword: "Olvidé mi contraseña",
				invalidCredentials: "Email o contraseña incorrectos. Por favor, inténtelo de nuevo.",
				missingFields: "Por favor, complete todos los campos.",
				rememberMe: "Recordarme",
				form: {
					email: "Email",
					password: "Contraseña",
					emailPlaceholder: "Ingrese su correo electrónico",
					passwordPlaceholder: "Ingrese su contraseña"
				},
				buttons: {
					submit: "Iniciar sesión",
					register: "¿No tienes una cuenta? ¡Regístrate!",
					returlogin: "Volver al menú principal",
					send: "Enviar Email"
				}
			},
			plans: {
				form: {
					name: "Nombre",
					users: "Usuarios",
					connections: "Conexiones",
					queue: "Departamentos",
					campaigns: "Campañas",
					schedules: "Agendamientos",
					email: "Correo Electrónico",
					chat: "Chat Interno",
					isVisible: "Mostrar",
					delete: "¿Realmente desea eliminar este registro?",
					api: "API Externa",
					kanban: "Kanban",
					whiteLabel: "Estilizador",
					integrations: "Integraciones",
					openAIAssistants: "Agentes IA",
					flowBuilder: "Constructor de Flujo",
					apiOfficial: "API Oficial",
					chatBotRules: "Reglas de ChatBot",
					storageLimit: "Límite de Almacenamiento (MB)",
					contentLimit: "Límite de Contenido Agentes (MB)",
					enabled: "Habilitadas",
					disabled: "Deshabilitadas",
					clear: "Cancelar",
					save: "Guardar",
					yes: "Sí",
					no: "No",
					money: "R$"
				}
			},
			companies: {
				title: "Gestión de Empresas",
				searchPlaceholder: "Buscar empresa...",
				table: {
					id: "ID",
					status: "Estado",
					name: "Nombre/Razón Social",
					email: "Correo Electrónico",
					value: "Valor",
					dueDate: "Vencimiento",
					actions: "Acciones"
				},
				status: {
					active: "Activo",
					inactive: "Inactivo"
				},
				buttons: {
					new: "Nueva Empresa",
					view: "Visualizar",
					edit: "Editar",
					delete: "Eliminar",
					cancel: "Cancelar",
					save: "Guardar",
					emailInvoice: "Enviar Factura por Correo Electrónico",
					whatsappInvoice: "Enviar Factura por WhatsApp"
				},
				fields: {
					personType: "Tipo de Persona",
					name: "Nombre",
					companyName: "Razón Social",
					document: "Documento",
					email: "Correo Electrónico",
					phone: "Teléfono",
					status: "Estado",
					plan: "Plan",
					zipCode: "Código Postal",
					state: "Estado",
					city: "Ciudad",
					neighborhood: "Barrio",
					street: "Calle",
					number: "Número",
					currentPlan: "Plan Actual",
					value: "Valor",
					dueDate: "Fecha de Vencimiento",
					dueDay: "Día de Vencimiento",
					recurrence: "Recurrencia"
				},
				personType: {
					individual: "Persona Física",
					company: "Persona Jurídica"
				},
				recurrence: {
					monthly: "Mensual",
					quarterly: "Trimestral",
					semiannual: "Semestral",
					annual: "Anual"
				},
				details: {
					title: "Detalles de la Empresa",
					tabs: {
						main: "Datos Principales",
						address: "Dirección",
						billing: "Plan y Facturación",
						resources: "Recursos"
					}
				},
				resources: {
					whatsapp: "Conexiones WhatsApp",
					users: "Usuarios",
					queues: "Departamentos"
				},
				edit: {
					title: "Editar Empresa",
					tabs: {
						main: "Datos Principales",
						address: "Dirección",
						billing: "Plan y Facturación"
					},
					validation: {
						nameRequired: "Nombre es obligatorio",
						nameMin: "El nombre debe tener al menos 2 caracteres",
						emailRequired: "El correo electrónico es obligatorio",
						emailInvalid: "Correo electrónico inválido",
						phoneRequired: "Teléfono es obligatorio",
						phoneOnlyNumbers: "El teléfono debe contener solo números",
						phoneMin: "El teléfono debe tener al menos 10 números",
						phoneMax: "El teléfono debe tener como máximo 11 números",
						planRequired: "El plan es obligatorio",
						dueDayFormat: "El día de vencimiento debe ser un número",
						dueDayRange: "El día de vencimiento debe estar entre 1 y 28",
						zipFormat: "El CEP debe tener 8 números",
						stateFormat: "El estado debe tener 2 letras"
					},
					errors: {
						loadPlans: "Error al cargar planes",
						update: "Error al actualizar empresa"
					},
					success: "Empresa actualizada con éxito"
				},
				deleteDialog: {
					title: "Confirmar Eliminación",
					message: "¿Estás seguro de que deseas eliminar la empresa {name}?"
				},
				toasts: {
					loadError: "Error al cargar empresas",
					deleted: "Empresa eliminada con éxito",
					deleteError: "Error al eliminar empresa",
					invoiceSentemailSuccess: "Factura enviada por correo electrónico con éxito",
					invoiceSentwhatsappSuccess: "Factura enviada por WhatsApp con éxito",
					invoiceSentemailError: "Error al enviar factura por correo electrónico",
					invoiceSentwhatsappError: "Error al enviar factura por WhatsApp"
				},
				confirmations: {
					deleteTitle: "Eliminar Empresa",
					deleteMessage: "¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer."
				},
				notifications: {
					deleteSuccess: "Empresa eliminada con éxito",
					deleteError: "Error al eliminar empresa",
					updateSuccess: "Empresa actualizada con éxito",
					updateError: "Error al actualizar empresa"
				}
			},
			auth: {
				toasts: {
					success: "¡Inicio de sesión exitoso!"
				},
				token: "Token"
			},
			companyModal: {
				form: {
					numberAttendants: "Cantidad de Atendentes",
					numberConections: "Cantidad de Conexiones"
				},
				success: "Empresa modificada con éxito.",
				add: "Empresa añadida con éxito."
			},
			dashboard: {
				tabs: {
					indicators: "Indicadores",
					assessments: "NPS",
					attendants: "Atendentes"
				},
				charts: {
					perDay: {
						title: "Atendimentos hoy: "
					},
					filters: {
						startDate: "Fecha Inicial",
						endDate: "Fecha Final",
						periodText: "Período",
						periodOptions: {
							input: "Seleccione el período deseado",
							zero: "Ningún período seleccionado",
							three: "Últimos tres días",
							seven: "Últimos siete días",
							fifteen: "Últimos quince días",
							thirty: "Últimos treinta días",
							sixty: "Últimos sesenta días",
							ninety: "Últimos noventa días"
						},
						duedate: "Fecha de Vencimiento",
						filtertype: {
							title: "Tipo de Filtro",
							valueA: "Filtro por Fecha",
							valueB: "Filtro por Período",
							helperText: "Seleccione el período deseado"
						}
					}
				},
				cards: {
					attdPendants: "Atd. Pendientes",
					attdHappening: "Atd. Ocurriendo",
					attdPerformed: "Atd. Realizados",
					leads: "Leads",
					mtofService: "T.M. de Atendimento",
					mtofwaiting: "T.M. de Espera",
					inAttendance: "En Atención",
					waiting: "Esperando",
					activeAttendants: "Atendentes Activos",
					finalized: "Finalizados",
					newContacts: "Nuevos Contactos",
					totalReceivedMessages: "Mensajes Recibidos",
					totalSentMessages: "Mensajes Enviados",
					averageServiceTime: "T.M. de Atendimento",
					averageWaitingTime: "T.M. de Espera",
					status: "Estado (Actual)"
				},
				date: {
					initialDate: "Fecha Inicial",
					finalDate: "Fecha Final"
				},
				users: {
					name: "Nombre",
					numberAppointments: "Cantidad de Atendimentos",
					statusNow: "Actual",
					totalCallsUser: "Total de atendimentos por usuario",
					totalAttendances: "Total de atendimentos"
				},
				licence: {
					available: "Disponible hasta"
				},
				assessments: {
					totalCalls: "Total de Atenciones",
					callsWaitRating: "Atendimentos esperando evaluación",
					callsWithoutRating: "Atendimentos sin evaluación",
					ratedCalls: "Atendimentos evaluados",
					evaluationIndex: "Índice de evaluación",
					score: "Puntuación",
					prosecutors: "Promotores",
					neutral: "Neutros",
					detractors: "Detractores"
				},
				stadis: {
					name: "Nombre",
					calif: "Evaluaciones",
					timemedia: "T.M. de Atendimento",
					statuschat: "Estado (Actual)"
				}
			},
			internalChat: {
				deletePrompt: "¿Esta acción no se puede deshacer, confirmar?"
			},
			messageRules: {
				title: "Identificadores de Mensajes",
				searchPlaceholder: "Buscar por nombre, patrón o descripción...",
				emptyState: {
					title: "Ningún identificador encontrado",
					description: "Todavía no tienes identificadores de mensajes configurados. Agrega tu primer identificador para automatizar el enrutamiento de mensajes.",
					button: "Añadir Identificador"
				},
				table: {
					name: "Nombre",
					pattern: "Patrón",
					connection: "Conexión",
					queue: "Sector",
					user: "Atendente",
					tags: "Etiquetas",
					priority: "Prioridad",
					status: "Estado",
					actions: "Acciones"
				},
				tabs: {
					all: "Todos",
					active: "Activos",
					inactive: "Inactivos"
				},
				form: {
					name: "Nombre del identificador",
					pattern: "Patrón de texto",
					patternHint: "Ingrese un texto que debe encontrarse en los mensajes. Ej: 'pedido', 'soporte', 'presupuesto'",
					isRegex: "Usar expresión regular",
					isRegexHint: "Habilitar para usar expresiones regulares (regex) para patrones más complejos",
					description: "Descripción",
					connection: "Conexión",
					allConnections: "Todas las conexiones",
					queue: "Sector de destino",
					noQueue: "Seleccione un sector",
					user: "Agente de destino",
					noUser: "Seleccione un agente",
					priority: "Prioridad",
					priorityHint: "Las reglas con mayor prioridad se aplican primero (0-100)",
					tags: "Etiquetas a aplicar",
					selectTags: "Seleccione etiquetas",
					active: "Activo",
					errors: {
						requiredName: "El nombre es obligatorio",
						requiredPattern: "El patrón de texto es obligatorio"
					}
				},
				buttons: {
					add: "Añadir Identificador",
					edit: "Editar",
					delete: "Eliminar",
					save: "Guardar",
					cancel: "Cancelar",
					activate: "Activar",
					deactivate: "Desactivar"
				},
				modal: {
					addTitle: "Añadir Identificador de Mensaje",
					editTitle: "Editar Identificador de Mensaje"
				},
				confirmModal: {
					title: "Eliminar Identificador",
					message: "¿Está seguro de que desea eliminar este identificador de mensaje? Esta acción no se puede deshacer."
				},
				toasts: {
					created: "¡Identificador creado con éxito!",
					updated: "¡Identificador actualizado con éxito!",
					deleted: "¡Identificador eliminado con éxito!",
					activated: "¡Identificador activado con éxito!",
					deactivated: "¡Identificador desactivado con éxito!"
				},
				noRecords: "No se encontró ningún identificador para los filtros seleccionados.",
				active: "Activo",
				inactive: "Inactivo",
				allConnections: "Todas las conexiones"
			},
			messageIdentifiers: {
				title: "Identificadores de Mensajes",
				description: "Configure reglas para el procesamiento automático de mensajes",
				createRule: "Crear nuevo identificador",
				editRule: "Editar identificador",
				deleteRule: "Eliminar identificador",
				selectConnection: "Seleccione la conexión",
				selectTags: "Seleccione las etiquetas",
				selectQueue: "Seleccione el sector",
				selectUser: "Seleccione el usuario (opcional)",
				patternHelp: "El sistema verificará cada mensaje recibido para encontrar este patrón",
				regexHelp: "Utilice expresiones regulares para patrones más complejos",
				priorityHelp: "Las reglas con mayor prioridad se aplicarán primero"
			},
			messageHistoryModal: {
				close: "Cerrar",
				title: "Historial de edición del mensaje"
			},
			uploads: {
				titles: {
					titleUploadMsgDragDrop: "ARRASTRE Y SUELTE ARCHIVOS EN EL CAMPO ABAJO",
					titleFileList: "Lista de archivo(s)"
				}
			},
			whatsappModal: {
				title: {
					add: "Nueva Conexión",
					edit: "Editar Conexión",
					editOfficial: "Editar Conexión WhatsApp Oficial",
					addOfficial: "Añadir Conexión WhatsApp Oficial"
				},
				form: {
					name: "Nombre",
					default: "Patrón",
					group: "Permitir Grupos",
					autoImport: "Importar contactos",
					autoReject: "Rechazar llamadas",
					availableQueues: "Departamentos",
					uploadMedia: "Subir Multimedia",
					clearMedia: "Limpiar Multimedia",
					token: "Token de Acceso",
					fileSize: "Tamaño máximo del archivo: 5MB",
					showQrCodeAfterSave: "Mostrar el código QR después de guardar la conexión",
					importOldMessagesEnable: "Importar mensajes antiguos",
					importOldMessagesGroups: "Importar mensajes de grupos",
					closedTicketsPostImported: "Cerrar tickets después de la importación",
					importOldMessages: "Fecha inicial para la importación",
					importRecentMessages: "Fecha final para la importación",
					importAlert: "La importación puede tardar dependiendo de la cantidad de mensajes. Por favor, espere.",
					queueRedirection: "Redirección de Sector",
					queueRedirectionDesc: "Seleccione a qué sector se redirigirán los tickets y después de cuánto tiempo",
					sendIdQueue: "Sector de Redirección",
					timeSendQueue: "Tiempo para Redirección (minutos)",
					integrationId: "ID de Integración",
					prompt: "Prompt de IA",
					disabled: "Deshabilitado",
					greetingMessage: "Mensaje de Bienvenida",
					complationMessage: "Mensaje de Conclusión",
					outOfHoursMessage: "Mensaje Fuera de Horario",
					ratingMessage: "Mensaje de Evaluación",
					collectiveVacationMessage: "Mensaje de Vacaciones Colectivas",
					collectiveVacationStart: "Inicio de las Vacaciones Colectivas",
					collectiveVacationEnd: "Fin de las Vacaciones Colectivas",
					timeCreateNewTicket: "Tiempo para Crear Nuevo Ticket (minutos)",
					maxUseBotQueues: "Límite de Uso del Chatbot",
					timeUseBotQueues: "Intervalo de Uso del Chatbot (minutos)",
					expiresTicket: "Cerrar Tickets Después de (horas)",
					whenExpiresTicket: "Cuando Cerrar",
					closeLastMessageOptions1: "Último mensaje del cliente",
					closeLastMessageOptions2: "Último mensaje del agente",
					expiresInactiveMessage: "Mensaje de Inactividad",
					timeInactiveMessage: "Tiempo para Mensaje de Inactividad (minutos)",
					inactiveMessage: "Mensaje de Inactivo",
					color: "Color de la Insignia",
					connectionInfo: "Información de la Conexión",
					metaApiConfig: "Configuración de la API Meta",
					officialWppBusinessId: "ID de WhatsApp Business",
					officialPhoneNumberId: "ID del Número de Teléfono",
					officialAccessToken: "Token de Acceso",
					queuesAndIntegrations: "Colas y Integraciones",
					messages: "Mensajes",
					settings: "Configuraciones"
				},
				buttons: {
					okAdd: "Guardar",
					okEdit: "Guardar",
					cancel: "Cancelar",
					refresh: "Actualizar Token",
					copy: "Copiar Token",
					upload: "Agregar Imagen",
					help: "Ayuda"
				},
				tabs: {
					general: "General",
					integrations: "Integraciones",
					messages: "Mensajes",
					chatbot: "Chatbot",
					assessments: "Evaluaciones",
					schedules: "Horarios"
				},
				help: {
					title: "Ayuda - WhatsApp",
					description: "Configuración de la conexión con WhatsApp",
					required: "Campos Obligatorios",
					name: "Nombre: Identificación única de la conexión",
					queue: "Sector: Sector por defecto para la dirección de los tickets"
				},
				validation: {
					nameRequired: "Nombre es obligatorio",
					nameMin: "El nombre debe tener al menos 2 caracteres",
					nameMax: "El nombre debe tener como máximo 50 caracteres",
					collectiveVacationStartRequired: "La fecha de inicio de las vacaciones es obligatoria",
					collectiveVacationEndRequired: "La fecha de fin de las vacaciones es obligatoria",
					collectiveVacationEndAfterStart: "La fecha final debe ser posterior a la fecha inicial",
					timeCreateNewTicketMin: "El tiempo debe ser mayor o igual a 0",
					maxUseBotQueuesMin: "El límite debe ser mayor o igual a 0",
					expiresTicketMin: "El tiempo debe ser mayor o igual a 0",
					tokenRequired: "El token de acceso es obligatorio",
					businessIdRequired: "El ID de WhatsApp Business es obligatorio",
					phoneNumberIdRequired: "El ID del Número de Teléfono es obligatorio"
				},
				success: {
					saved: "¡WhatsApp guardado con éxito!",
					update: "¡WhatsApp actualizado con éxito!"
				},
				tokenRefreshed: "¡Token actualizado con éxito!",
				tokenCopied: "¡Token copiado al portapapeles!",
				scheduleSaved: "¡Horarios guardados con éxito!",
				errors: {
					fetchData: "Error al cargar los datos",
					fetchWhatsApp: "Error al cargar los datos de WhatsApp",
					saveWhatsApp: "Error al guardar WhatsApp",
					fileSize: "Archivo demasiado grande. Máximo permitido: 5MB",
					requiredFields: "Complete todos los campos obligatorios"
				}
			},
			profile: {
				title: "Perfil",
				roles: {
					admin: "Administrador",
					user: "Usuario",
					superv: "Supervisor"
				},
				buttons: {
					edit: "Editar Perfil"
				},
				stats: {
					openTickets: "Tickets Abiertos",
					closedToday: "Cerrados Hoy",
					averageResponseTime: "Tiempo Promedio de Respuesta",
					rating: "Evaluación"
				},
				fields: {
					name: "Nombre",
					email: "Email",
					workHours: "Horario de Trabajo"
				}
			},
			queueIntegrationModal: {
				title: {
					add: "Agregar proyecto",
					edit: "Editar proyecto"
				},
				form: {
					id: "ID",
					type: "Tipo",
					name: "Nombre",
					projectName: "Nombre del Proyecto",
					language: "Lenguaje",
					jsonContent: "Contenido Json",
					urlN8N: "URL",
					n8nApiKey: "Clave de API de n8n",
					OpenApiKey: "Clave de API de OpenAI",
					typebotSlug: "Typebot - Slug",
					selectFlow: "Nombre del Flujo",
					typebotExpires: "Tiempo en minutos para expirar una conversación",
					typebotKeywordFinish: "Palabra para finalizar el ticket",
					typebotKeywordRestart: "Palabra para reiniciar el flujo",
					typebotRestartMessage: "Mensaje al reiniciar la conversación",
					typebotUnknownMessage: "Mensaje de opción inválida",
					typebotDelayMessage: "Intervalo (ms) entre mensajes"
				},
				buttons: {
					okAdd: "Guardar",
					okEdit: "Guardar",
					cancel: "Cancelar",
					test: "Probar Bot"
				},
				messages: {
					testSuccess: "¡Integración probada con éxito!",
					addSuccess: "Integración añadida con éxito.",
					editSuccess: "Integración editada con éxito."
				}
			},
			promptModal: {
				form: {
					name: "Nombre",
					prompt: "Prompt",
					voice: "Voz",
					max_tokens: "Máximo de Tokens en la respuesta",
					temperature: "Temperatura",
					apikey: "Clave API",
					max_messages: "Máximo de mensajes en el Historial",
					voiceKey: "Clave de la API de Voz",
					voiceRegion: "Región de Voz"
				},
				success: "¡Prompt guardado con éxito!",
				title: {
					add: "Agregar Prompt",
					edit: "Editar Prompt"
				},
				buttons: {
					okAdd: "Guardar",
					okEdit: "Guardar",
					cancel: "Cancelar"
				}
			},
			prompts: {
				title: "Prompts",
				noDataFound: "¡Ups, nada por aquí!",
				noDataFoundMessage: "¡No se encontró ningún prompt. No te preocupes, ¡puedes crear el primero! Haz clic en el botón de abajo para empezar.",
				table: {
					name: "Nombre",
					queue: "Sector",
					max_tokens: "Respuestas Máximas de Tokens",
					actions: "Acciones"
				},
				confirmationModal: {
					deleteTitle: "Eliminar",
					deleteMessage: "¿Estás seguro? ¡Esta acción no se puede deshacer!"
				},
				buttons: {
					add: "Crear Prompt"
				}
			},
			contactsImport: {
				notifications: {
					started: "¡Importación iniciada! Se le notificará sobre el progreso.",
					error: "Error al iniciar la importación. Inténtelo de nuevo.",
					noFile: "Seleccione un archivo CSV para importar",
					progress: "Importación en progreso: {percentage}% completado",
					complete: "¡Importación completada! {validCount} contactos importados con éxito. {invalidCount} contactos inválidos.",
					importError: "Error en la importación: {message}"
				},
				instructions: {
					title: "Para realizar la importación de contactos, es necesario que siga las instrucciones a continuación:",
					csvFormat: "El archivo a importar debe estar en formato .CSV.",
					numberFormat: "Los números de WhatsApp deben ingresarse sin espacios y separados por punto y coma (;).",
					exampleTitle: "Ejemplo de cómo debe completarse la hoja de cálculo."
				}
			},
			contacts: {
				title: "Gestión de Contactos",
				subtitle: "de",
				searchPlaceholder: "Buscar contactos...",
				emptyMessage: "No se encontraron contactos",
				noContactsFound: "No se encontraron contactos",
				noContactsFoundMessage: "Aún no se ha registrado ningún contacto.",
				addContactMessage: "¡Agregue un nuevo contacto para comenzar!",
				import: {
					title: "Importar Contactos",
					steps: {
						selectFile: "Seleccionar Archivo",
						mapFields: "Mapear Campos",
						review: "Revisar",
						result: "Resultado"
					},
					mapFields: "Mapeo de Campos",
					selectFilePrompt: "Seleccione un archivo CSV o Excel para importar contactos",
					dragAndDrop: "Arrastre y suelte su archivo aquí",
					or: "o",
					browse: "Buscar",
					supportedFormats: "Formatos admitidos: CSV, XLS, XLSX",
					needTemplate: "¿Necesita un modelo?",
					downloadTemplate: "Descargar modelo",
					processingFile: "Procesando archivo...",
					mapFieldsInfo: "Seleccione qué columnas de su archivo corresponden a cada campo de contacto. Los campos marcados con * son obligatorios.",
					fullContact: "Importar datos completos (incluyendo campos adicionales)",
					selectField: "Seleccione un campo",
					extraFields: "Campos adicionales",
					extraFieldsInfo: "Mapee campos adicionales que se importarán como información adicional del contacto.",
					noExtraFields: "Ningún campo adicional mapeado.",
					addExtraField: "Agregar campo adicional",
					extraFieldName: "Nombre del campo adicional",
					value: "Valor",
					validationErrors: "Se encontraron {{count}} errores de validación",
					errorDetails: "{{count}} registros con problemas",
					rowError: "Línea {{row}}: {{error}}",
					moreErrors: "...y {{count}} errores más",
					validation: {
						nameRequired: "El campo Nombre es obligatorio",
						numberRequired: "El campo Número es obligatorio",
						emptyName: "Nombre en blanco",
						emptyNumber: "Número en blanco",
						invalidNumberFormat: "Formato de número inválido",
						invalidEmail: "Email inválido",
						companyNotFound: "Empresa \"{{company}}\" no encontrada, se creará automáticamente",
						positionNotFound: "Cargo \"{{position}}\" no encontrado, se creará automáticamente",
						dataErrors: "{{count}} registros contienen errores"
					},
					reviewAndImport: "Revisar e importar",
					reviewInfo: "Verifique que los datos sean correctos antes de iniciar la importación.",
					summary: "Resumen",
					totalRecords: "Total de registros",
					validRecords: "Registros válidos",
					invalidRecords: "Registros con advertencias",
					importMode: "Modo de importación",
					fullContactMode: "Registro completo",
					basicContactMode: "Registro básico",
					mappedFields: "Campos mapeados",
					notMapped: "No mapeado",
					extraField: "Campo adicional",
					previewData: "Visualización de los datos",
					showingFirst: "Mostrando los primeros {{count}} de {{total}} registros",
					importingContacts: "Importando contactos...",
					pleaseWait: "Por favor, espere. Esto puede tomar unos minutos.",
					importComplete: "Importación completada",
					importFailed: "Fallo en la importación",
					totalProcessed: "Total procesado",
					successful: "Éxito",
					failed: "Fallos",
					errors: {
						invalidFileType: "Tipo de archivo inválido",
						emptyFile: "Archivo vacío",
						parsingFailed: "Error al procesar el archivo",
						readFailed: "Error al leer el archivo",
						processingFailed: "Error al procesar el archivo",
						fetchEmployersFailed: "Error al buscar empleadores",
						fetchPositionsFailed: "Error al buscar posiciones",
						validationFailed: "La validación falló. Corrija los errores antes de continuar.",
						importFailed: "Fallo en la importación",
						generalError: "Error general en la importación",
						timeout: "Tiempo de importación excedido",
						statusCheckFailed: "Error al verificar el estado de la importación",
						templateGenerationFailed: "Error al generar el modelo"
					},
					successMessage: "{{count}} contactos se importaron con éxito.",
					failureMessage: "Ningún contacto fue importado. Verifique los errores e inténtelo de nuevo.",
					importAnother: "Importar más contactos",
					import: "Importar"
				},
				table: {
					id: "ID",
					name: "Nombre",
					number: "Número",
					email: "Email",
					company: "Empresa",
					tags: "Etiquetas",
					bot: "Bot",
					actions: "Acciones",
					whatsapp: "WhatsApp",
					groupId: "ID del Grupo",
					botEnabled: "Bot Activado",
					botDisabled: "Bot Desactivado",
					disableBot: "Estado del Bot",
					noTags: "Sin etiquetas"
				},
				buttons: {
					add: "Agregar Contacto",
					addContact: "Agregar Contacto",
					edit: "Editar Contacto",
					delete: "Eliminar Contacto",
					deleteAll: "Eliminar Todos",
					addOrDelete: "Gestionar",
					import: "Importar",
					export: "Exportar",
					importExport: "Importar/Exportar",
					startChat: "Iniciar conversación",
					block: "Bloquear contacto",
					unblock: "Desbloquear contacto",
					manage: "Opciones"
				},
				bulkActions: {
					selectedContacts: "{{count}} contactos seleccionados",
					actions: "Acciones en masa",
					enableBot: "Activar Bot",
					disableBot: "Desactivar Bot",
					block: "Bloquear",
					unblock: "Desbloquear",
					delete: "Eliminar"
				},
				confirmationModal: {
					deleteTitleNoHasContactCreated: "Ningún contacto registrado",
					deleteTitleNoHasContactCreatedMessage: "Aún no tienes contactos registrados. Haz clic en 'Agregar' para crear un nuevo contacto.",
					deleteTitle: "Eliminar contacto",
					deleteMessage: "Esta acción es irreversible. ¿Estás seguro de que deseas eliminar este contacto?",
					deleteAllTitle: "Eliminar todos los contactos",
					deleteAllMessage: "Esta acción es irreversible. ¿Estás seguro de que deseas eliminar todos los contactos?",
					blockTitle: "Bloquear contacto",
					blockMessage: "Al bloquear este contacto, ya no podrás enviar ni recibir mensajes de él.",
					unblockTitle: "Desbloquear contacto",
					unblockMessage: "Al desbloquear este contacto, volverás a recibir mensajes de él.",
					bulkEnableBotTitle: "Activar Bot para contactos seleccionados",
					bulkEnableBotMessage: "¿Estás seguro de que deseas activar el bot para todos los contactos seleccionados?",
					bulkDisableBotTitle: "Desactivar Bot para contactos seleccionados",
					bulkDisableBotMessage: "¿Estás seguro de que deseas desactivar el bot para todos los contactos seleccionados?",
					bulkBlockTitle: "Bloquear contactos seleccionados",
					bulkBlockMessage: "¿Estás seguro de que deseas bloquear todos los contactos seleccionados? No podrás enviar ni recibir mensajes de ellos.",
					bulkUnblockTitle: "Desbloquear contactos seleccionados",
					bulkUnblockMessage: "¿Estás seguro de que deseas desbloquear todos los contactos seleccionados? Volverás a recibir mensajes de ellos.",
					bulkDeleteTitle: "Eliminar contactos seleccionados",
					bulkDeleteMessage: "Esta acción es irreversible. ¿Estás seguro de que deseas eliminar todos los contactos seleccionados?",
					genericTitle: "Confirmar acción",
					genericMessage: "¿Estás seguro de que deseas ejecutar esta acción?"
				},
				toasts: {
					deleted: "¡Contacto eliminado con éxito!",
					deletedAll: "¡Todos los contactos fueron eliminados con éxito!",
					blocked: "¡Contacto bloqueado con éxito!",
					unblocked: "¡Contacto desbloqueado con éxito!",
					bulkBotEnabled: "¡Bot activado para los contactos seleccionados!",
					bulkBotDisabled: "¡Bot desactivado para los contactos seleccionados!",
					bulkBlocked: "¡Contactos seleccionados fueron bloqueados!",
					bulkUnblocked: "¡Contactos seleccionados fueron desbloqueados!",
					bulkDeleted: "¡Contactos seleccionados fueron eliminados!",
					noContactsSelected: "Ningún contacto seleccionado",
					unknownAction: "Acción desconocida",
					bulkActionError: "Error al ejecutar acción en masa"
				},
				form: {
					name: "Nombre",
					number: "Número",
					email: "Correo Electrónico",
					company: "Empresa",
					position: "Cargo"
				},
				filters: {
					byTag: "Filtrar por etiqueta",
					selectTags: "Seleccione las etiquetas a filtrar",
					noTagsAvailable: "Ninguna etiqueta disponible"
				}
			},
			contactModal: {
				title: {
					new: "Nuevo Contacto",
					edit: "Editar Contacto"
				},
				helpText: "Complete los datos del contacto. El número de teléfono debe estar en el formato: DDI DDD NÚMERO (Ej: 55 16 996509803)",
				sections: {
					basic: "Informaciones Básicas",
					tags: "Etiquetas",
					organization: "Informaciones Organizacionales",
					additional: "Informaciones Adicionales"
				},
				form: {
					name: "Nombre",
					number: "Número",
					email: "Email",
					numberFormat: "Formato: DDI DDD NÚMERO (Ej: 55 16 996509803)",
					numberTooltip: "Utilice el formato: DDI DDD NÚMERO (Ej: 55 16 996509803)",
					company: "Empresa",
					position: "Cargo",
					selectCompanyFirst: "Seleccione una empresa primero",
					positionHelp: "Escriba para crear un nuevo cargo o seleccione uno existente",
					disableBot: "Desactivar Bot",
					extraName: "Nombre del Campo",
					extraValue: "Valor del Campo",
					noExtraInfo: "Sin información adicional. Haz clic en el botón de abajo para agregar."
				},
				buttons: {
					cancel: "Cancelar",
					save: "Guardar",
					update: "Actualizar",
					remove: "Eliminar",
					addExtraInfo: "Agregar Campo",
					okEdit: "Editar",
					okAdd: "Agregar"
				},
				tags: {
					saveFirst: "Las etiquetas se pueden agregar después de guardar el contacto."
				},
				success: {
					created: "¡Contacto creado exitosamente!",
					updated: "¡Contacto actualizado exitosamente!",
					profilePic: "¡Foto de perfil actualizada exitosamente!"
				},
				warnings: {
					tagsSyncFailed: "Contacto guardado, pero hubo un error al agregar las etiquetas"
				},
				errors: {
					loadData: "Error al cargar los datos necesarios",
					loadCompanies: "Error al cargar empresas",
					saveGeneric: "Error al guardar el contacto. Verifica los datos e intenta nuevamente."
				}
			},
			contactTagsManager: {
				selectTags: "Seleccione las etiquetas",
				noTags: "Ninguna etiqueta asignada a este contacto",
				success: {
					updated: "¡Etiquetas actualizadas exitosamente!"
				},
				errors: {
					loadTags: "Error al cargar las etiquetas",
					loadContactTags: "Error al cargar las etiquetas del contacto",
					updateTags: "Error al actualizar las etiquetas"
				}
			},
			newPositionModal: {
				title: "Nuevo Cargo",
				form: {
					name: "Nombre"
				},
				buttons: {
					cancel: "Cancelar",
					save: "Guardar"
				},
				validation: {
					required: "El campo Nombre es obligatorio."
				},
				success: "¡Cargo creado exitosamente!",
				error: "Error al crear el cargo. Inténtalo de nuevo más tarde."
			},
			employerModal: {
				title: "Nueva Empresa",
				success: "Empresa registrada exitosamente",
				form: {
					name: "Nombre de la Empresa"
				}
			},
			userModal: {
				title: {
					add: "Agregar Usuario",
					edit: "Editar Usuario"
				},
				tabs: {
					info: "Informaciones",
					permission: "Permisos",
					notifications: "Notificaciones"
				},
				form: {
					name: "Nombre",
					email: "Correo Electrónico",
					password: "Contraseña",
					profileT: "Perfil",
					profile: {
						admin: "Administrador",
						user: "Usuario",
						superv: "Supervisor"
					},
					profileHelp: "Define el nivel de acceso del usuario en el sistema",
					ramal: "Extensión",
					startWork: "Inicio del Turno",
					endWork: "Fin del Turno",
					workHoursHelp: "Define el horario de trabajo del usuario",
					super: "Super Usuario",
					superHelp: "Permite acceso total al sistema",
					allTicket: "Ver Todos los Tickets",
					allTicketHelp: "Permite visualizar todos los tickets, incluidos los sin sector",
					spy: "Espiar Conversaciones",
					spyHelp: "Permite espiar conversaciones en curso",
					isTricked: "Ver Lista de Contactos",
					isTrickedHelp: "Permite visualizar la lista de contactos",
					defaultMenu: "Menú Predeterminado",
					defaultMenuHelp: "Define el estado inicial del menú lateral",
					defaultMenuOpen: "Abierto",
					defaultMenuClosed: "Cerrado",
					color: "Color del Usuario",
					colorHelp: "Color de identificación del usuario en el sistema",
					whatsapp: "Conexión Predeterminada",
					whatsappHelp: "Conexión predeterminada a la que el usuario responderá",
					whatsappNone: "Ninguno",
					number: "Número de WhatsApp",
					numberHelp: "Número que recibirá las notificaciones (con DDD)",
					notificationSettings: "Configuraciones de Notificación a través de WhatsApp",
					notificationTypes: "Tipos de Notificación",
					notifyNewTicket: "Notificación de Nuevo Atendimento",
					notifyNewTicketHelp: "Envía notificación en WhatsApp cuando haya un nuevo atendimento en las colas de este usuario",
					notifyTask: "Notificación de Tareas",
					notifyTaskHelp: "Envía notificación en WhatsApp sobre nuevas tareas o tareas vencidas asignadas a este usuario",
					onlyAdminSupervHelp: "Solo los administradores y supervisores pueden editar las configuraciones de notificación.",
					profilePicHelp: "Haz clic en la imagen para cambiar",
					canRestartConnections: "Reiniciar Conexiones",
					canRestartConnectionsHelp: "Permite al usuario reiniciar conexiones de WhatsApp"
				},
				buttons: {
					cancel: "Cancelar",
					okAdd: "Agregar",
					okEdit: "Guardar"
				},
				success: "¡Usuario guardado exitosamente!",
				errors: {
					load: "Error al cargar usuario",
					save: "Error al guardar usuario"
				}
			},
			scheduleModal: {
				title: {
					add: "Nuevo Agendamiento",
					edit: "Editar Agendamiento"
				},
				form: {
					body: "Mensaje",
					contact: "Contacto",
					sendAt: "Fecha de Agendamiento",
					sentAt: "Fecha de Envío"
				},
				buttons: {
					okAdd: "Agregar",
					okEdit: "Guardar",
					cancel: "Cancelar"
				},
				success: "Agendamiento guardado exitosamente."
			},
			chat: {
				title: "Chat Interno",
				conversations: "Conversaciones",
				chatList: "Lista de Conversaciones",
				messages: "Mensajes",
				recentMessages: "Mensajes Recientes",
				selectChat: "Selecciona una conversación",
				selectChatMessage: "Elige una conversación para empezar a interactuar",
				newChat: "Nueva Conversación",
				editChat: "Editar Conversación",
				deleteChat: "Eliminar Conversación",
				delete: "Eliminar Conversación",
				createGroup: "Crear Grupo",
				leaveGroup: "Salir del Grupo",
				chatTitle: "Título de la Conversación",
				selectUsers: "Seleccionar Participantes",
				searchUsers: "Buscar usuarios...",
				selectedUsers: "Participantes Seleccionados",
				create: "Crear",
				saveChanges: "Guardar Cambios",
				cancel: "Cancelar",
				titleRequired: "El título es obligatorio",
				titleMinLength: "El título debe tener al menos 3 caracteres",
				titleMaxLength: "El título debe tener como máximo 50 caracteres",
				usersRequired: "Seleccione al menos un participante",
				sendMessage: "Enviar mensaje",
				typeMessage: "Escribe tu mensaje...",
				messagePlaceholder: "Escribe un mensaje",
				noMessages: "Aún no hay mensajes",
				loadingMessages: "Cargando mensajes...",
				loadMore: "Cargar más",
				messageDeleted: "Mensaje eliminado",
				attachFile: "Adjuntar archivo",
				uploadImage: "Enviar imagen",
				uploadVideo: "Enviar vídeo",
				recordAudio: "Grabar audio",
				stopRecording: "Detener grabación",
				preview: "Previsualización",
				send: "Enviar",
				downloading: "Descargando...",
				uploading: "Enviando...",
				copyMessage: "Copiar mensaje",
				deleteMessage: "Eliminar mensaje",
				editMessage: "Editar mensaje",
				quoteMessage: "Responder",
				typing: "escribiendo...",
				online: "En línea",
				offline: "Desconectado",
				lastSeen: "Visto por última vez",
				recording: "Grabando...",
				deleteConfirmTitle: "Eliminar Conversación",
				deleteConfirmMessage: "¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.",
				leaveConfirmTitle: "Salir del Grupo",
				leaveConfirmMessage: "¿Estás seguro de que deseas salir de este grupo?",
				blockUser: "Bloquear usuario",
				unblockUser: "Desbloquear usuario",
				reportUser: "Denunciar usuario",
				blockUserConfirm: "Confirmar bloqueo",
				blockUserMessage: "¿Estás seguro de que deseas bloquear a este usuario?",
				reportUserTitle: "Denunciar Usuario",
				reportPlaceholder: "Describe el motivo de la denuncia",
				userBlocked: "Usuario bloqueado",
				userUnblocked: "Usuario desbloqueado",
				reportSent: "Denuncia enviada",
				exportChat: "Exportar conversación",
				exportPdf: "Exportar como PDF",
				exportSuccess: "Conversación exportada exitosamente",
				viewMode: "Modo de visualización",
				listView: "Visualización en lista",
				gridView: "Visualización en cuadrícula",
				tooltips: {
					sendButton: "Enviar mensaje",
					attachButton: "Adjuntar archivo",
					recordButton: "Grabar audio",
					emojiButton: "Insertar emoji",
					blockButton: "Bloquear usuario",
					reportButton: "Denunciar usuario",
					exportButton: "Exportar conversación",
					editButton: "Editar conversación",
					deleteButton: "Eliminar conversación",
					searchButton: "Buscar en los mensajes",
					viewModeButton: "Alternar modo de visualización"
				},
				errors: {
					loadError: "Error al cargar conversaciones",
					loadMessagesError: "Error al cargar mensajes",
					sendError: "Error al enviar mensaje",
					uploadError: "Error al enviar archivo",
					recordingError: "Error al grabar audio",
					deleteError: "Error al eliminar conversación",
					createError: "Error al crear conversación",
					editError: "Error al editar conversación",
					blockError: "Error al bloquear usuario",
					reportError: "Error al enviar denuncia",
					exportError: "Error al exportar conversación",
					loadUsersError: "Error al cargar usuarios",
					searchError: "Error en la búsqueda de usuarios",
					saveError: "Error al guardar conversación"
				},
				success: {
					messageSent: "Mensaje enviado",
					conversationCreated: "Conversación creada exitosamente",
					conversationUpdated: "Conversación actualizada exitosamente",
					conversationDeleted: "Conversación eliminada exitosamente",
					userBlocked: "Usuario bloqueado exitosamente",
					userUnblocked: "Usuario desbloqueado exitosamente",
					reportSent: "Denuncia enviada exitosamente",
					chatExported: "Conversación exportada exitosamente",
					createSuccess: "Conversación creada exitosamente",
					editSuccess: "Conversación actualizada exitosamente"
				},
				empty: {
					noChats: "No se encontraron conversaciones",
					noMessages: "No se encontraron mensajes",
					noResults: "No se encontraron resultados",
					startConversation: "¡Comienza una nueva conversación!",
					noConversations: "Todavía no tienes conversaciones"
				},
				search: {
					searchChats: "Buscar conversaciones",
					searchMessages: "Buscar mensajes",
					searchUsers: "Buscar usuarios",
					noResults: "No se encontraron resultados",
					searching: "Buscando..."
				}
			},
			ticketsManager: {
				buttons: {
					newTicket: "Nuevo",
					newGroup: "Nuevo Grupo"
				}
			},
			ticketsQueueSelect: {
				placeholder: "Departamentos"
			},
			tickets: {
				inbox: {
					closeAll: "Cerrar todos los tickets",
					confirmCloseTitle: "Cerrar tickets",
					confirmCloseConnectionMessage: "¿Desea cerrar todos los tickets de la conexión {{connection}}?",
					confirmCloseAllMessage: "¿Desea cerrar todos los tickets de todas las conexiones?",
					confirm: "Confirmar",
					cancel: "Cancelar",
					yes: "SÍ",
					no: "NO",
					closedAllTickets: "¿Desea cerrar todos los tickets?",
					newTicket: "Nuevo Ticket",
					open: "Abiertos",
					resolverd: "Resueltos",
					ticketDeleteSuccessfully: "Ticket eliminado con éxito."
				},
				toasts: {
					deleted: "El servicio al cliente en el que estaba fue eliminado."
				},
				notification: {
					message: "Mensaje de"
				},
				tabs: {
					open: {
						title: "Abiertas"
					},
					group: {
						title: "Grupos"
					},
					private: {
						title: "Privados"
					},
					closed: {
						title: "Resueltos"
					},
					search: {
						title: "Búsqueda"
					}
				},
				search: {
					filterConnections: "Conexión",
					ticketsPerPage: "Tickets por página",
					placeholder: "Buscar atención y mensajes",
					filterConectionsOptions: {
						open: "Abierto",
						closed: "Cerrado",
						pending: "Pendiente",
						group: "Grupos"
					}
				},
				connections: {
					allConnections: "Todas las conexiones"
				},
				buttons: {
					showAll: "Todos",
					refresh: "Actualizar"
				}
			},
			statistics: {
				title: "Estadísticas",
				startDate: "Fecha de inicio",
				endDate: "Fecha de fin",
				stateFilter: "Filtrar por Estado",
				dddFilter: "Filtrar por DDD",
				allStates: "Todos los Estados",
				selectDDDs: "Seleccionar DDDs",
				buttons: {
					generate: "Generar informe"
				},
				fetchSuccess: "Estadísticas cargadas con éxito",
				fetchError: "Error al cargar estadísticas",
				cards: {
					totalAttendances: "Total de Atenciones",
					openTickets: "Tickets Abiertos",
					averageResponseTime: "Tiempo Promedio de Respuesta",
					newContacts: "Nuevos Contactos",
					stateContacts: "Contactos en el Estado",
					stateContactsBreakdown: "{{dddCount}} de {{stateTotal}} contactos en {{state}}"
				},
				charts: {
					ticketsEvolution: "Evolución de Tickets",
					ticketsChannels: "Canales de Tickets",
					brazilMap: "Mapa de Contactos por Estado"
				}
			},
			transferTicketModal: {
				title: "Transferir Ticket",
				fieldLabel: "Escribe para buscar usuarios",
				comments: "Comentarios",
				fieldQueueLabel: "Transferir a un sector",
				fieldQueuePlaceholder: "Seleccione un sector",
				noOptions: "No se encontraron usuarios con ese nombre",
				fieldConnectionSelect: "Seleccione una conexión",
				buttons: {
					ok: "Transferir",
					cancel: "Cancelar"
				}
			},
			ticketsList: {
				pendingHeader: "Esperando",
				assignedHeader: "Atendiendo",
				noTicketsTitle: "¡Nada aquí!",
				noTicketsMessage: "No se encontró ningún servicio de atención al cliente con ese estado o término de búsqueda",
				tagModalTitle: "Etiquetas del Ticket",
				noTagsAvailable: "Ninguna etiqueta disponible",
				buttons: {
					exportAsPdf: "Exportar como PDF",
					accept: "Aceptar",
					closed: "Finalizar",
					reopen: "Reabrir",
					close: "Cerrar"
				}
			},
			newTicketModal: {
				statusConnected: "CONECTADO",
				statusDeconnected: "DESCONECTADO",
				connectionDefault: "Patrón",
				title: "Crear Ticket",
				fieldLabel: "Escribe para buscar el contacto",
				add: "Agregar",
				buttons: {
					ok: "Guardar",
					cancel: "Cancelar"
				},
				queue: "Seleccione un sector",
				conn: "Seleccione una conexión"
			},
			ticketdetails: {
				iconspy: "Espiar Conversación",
				iconacept: "Aceptar Conversación",
				iconreturn: "Volver al sector",
				iconstatus: "SIN SECTOR"
			},
			SendContactModal: {
				title: "Enviar contacto(s)",
				fieldLabel: "Escribe para buscar",
				selectedContacts: "Contactos seleccionados",
				add: "Crear nuevo contacto",
				buttons: {
					newContact: "Crear nuevo contacto",
					cancel: "cancelar",
					ok: "enviar"
				}
			},
			daysweek: {
				day1: "Lunes",
				day2: "Martes",
				day3: "Miércoles",
				day4: "Jueves",
				day5: "Viernes",
				day6: "Sábado",
				day7: "Domingo",
				save: "GUARDAR"
			},
			mainDrawer: {
				listTitle: {
					service: "Atenciones",
					management: "Gerencia",
					administration: "Administración"
				},
				listItems: {
					dashboard: "Tablero",
					statistics: "Estadísticas",
					connections: "Conexiones",
					groups: "Grupos",
					flowBuilder: "Flujos de Conversación",
					messageRules: "Reglas del ChatBot",
					tickets: "Conversaciones",
					chatsTempoReal: "Chat en Vivo",
					tasks: "Tareas",
					quickMessages: "Respuestas Rápidas",
					asaasServices: "Servicios de Asaas",
					contacts: {
						menu: "Contactos",
						list: "Agenda de Contactos",
						employers: "Empresas",
						employerspwd: "Banco de Contraseñas",
						positions: "Cargos"
					},
					queues: "Departamentos y Chatbot",
					tags: "Etiquetas",
					kanban: "Kanban",
					email: "Correo Electrónico",
					users: "Colaboradores",
					whatsappTemplates: "Plantillas de Whatsapp",
					settings: "Configuraciones",
					helps: "Centro de Ayuda",
					messagesAPI: "API",
					internalAPI: "API Interna",
					api: "API",
					zabbix: "Painel Zabbix",
					adminDashboard: "Visión Geral",
					schedules: "Agendamientos",
					campaigns: "Campañas",
					annoucements: "Informativos",
					chats: "Chat Interno",
					financeiro: "Financiero",
					files: "Lista de archivos",
					reports: "Informes",
					integrations: {
						menu: "Automatizaciones"
					},
					prompts: "OpenAI Prompts",
					profiles: "Perfiles de Acceso",
					permissions: "Permisos",
					assistants: "Agentes de OpenAI",
					queueIntegration: "Integraciones",
					typebot: "Typebot",
					companies: "Empresas",
					version: "Versión",
					exit: "Salir"
				},
				appBar: {
					notRegister: "Sin conexión activa.",
					greetings: {
						hello: "Hola, ",
						tasks: "¡Tienes {{count}} tareas abiertas!",
						one: "Hola ",
						two: "Bienvenido a ",
						three: "Activo hasta"
					},
					menu: "Menú",
					tasks: "Tareas",
					notifications: "Notificaciones",
					volume: "Volumen",
					refresh: "Actualizar",
					backup: {
						title: "Respaldo",
						backup: "Hacer respaldo",
						schedule: "Programar correos electrónicos"
					},
					user: {
						profile: "Perfil",
						darkmode: "Modo oscuro",
						lightmode: "Modo claro",
						language: "Idioma",
						logout: "Salir"
					},
					i18n: {
						language: "Español",
						language_short: "ES",
					},
				}
			},
			email: {
				title: {
					sendEmail: "Enviar Email",
					scheduleEmail: "Programar Correo Electrónico",
					emailList: "Lista de Correos Electrónicos"
				},
				fields: {
					sender: "Destinatario",
					subject: "Asunto",
					message: "Mensaje",
					sendAt: "Fecha de Envío",
					attachments: "Adjunto(s)"
				},
				placeholders: {
					sender: "email@exemplo.com (separar múltiplos emails por vírgula)",
					subject: "Ingrese el asunto del correo electrónico",
					message: "Escribe tu mensaje aquí..."
				},
				validations: {
					senderRequired: "El destinatario es obligatorio",
					invalidEmails: "Uno o más correos electrónicos son inválidos",
					subjectRequired: "El asunto es obligatorio",
					messageRequired: "El mensaje es obligatorio",
					dateInPast: "La fecha no puede ser en el pasado"
				},
				buttons: {
					send: "Enviar",
					schedule: "Programar",
					cancel: "Cancelar",
					close: "Cerrar",
					reschedule: "Reprogramar",
					attachFile: "Adjuntar Archivo",
					showAdvanced: "Opciones Avanzadas",
					hideAdvanced: "Ocultar Opciones Avanzadas",
					showMore: "Ver Más",
					showLess: "Ver Menos",
					removeAttachment: "Eliminar adjunto"
				},
				tabs: {
					send: "Enviar",
					schedule: "Programar",
					list: "Listar",
					sent: "Enviados",
					scheduled: "Programados"
				},
				status: {
					sent: "Enviado",
					pending: "Pendiente",
					error: "Error",
					unknown: "Desconocido"
				},
				errors: {
					loadEmails: "Error al cargar correos electrónicos",
					apiError: "Error en la API",
					cancelError: "Error al cancelar correo electrónico",
					rescheduleError: "Error al reprogramar correo electrónico",
					exportError: "Error al exportar correos electrónicos"
				},
				helperTexts: {
					recipientCount: "{count} destinatario(s)",
					attachmentCount: "{count} archivo(s) seleccionado(s)",
					sendAt: "Elija una fecha y hora futura para el envío"
				},
				tooltips: {
					sender: "Ingrese uno o más correos electrónicos separados por comas",
					subject: "Ingrese un asunto informativo",
					message: "Escribe tu mensaje",
					sendAt: "Elige cuándo se enviará el correo electrónico",
					refresh: "Actualizar",
					export: "Exportar",
					viewEmail: "Ver Correo",
					moreOptions: "Más Opciones"
				},
				dueDateNotification: {
					title: "Disparos de notificaciones de factura",
					error: "Se produjo un error al enviar las notificaciones",
					close: "Cerrar"
				},
				filters: {
					all: "Todos",
					sent: "Enviados",
					pending: "Pendientes",
					error: "Errores"
				},
				search: {
					placeholder: "Buscar correos electrónicos..."
				},
				noEmails: "No se encontraron correos electrónicos",
				noSubject: "(Sin asunto)",
				sentAt: "Enviado en",
				scheduledFor: "Programado para",
				days: {
					monday: "Lunes",
					tuesday: "Martes",
					wednesday: "Miércoles",
					thursday: "Jueves",
					friday: "Viernes",
					saturday: "Sábado",
					sunday: "Domingo"
				},
				chart: {
					title: "Estadísticas de Envío",
					lineChart: "Gráfico de Línea",
					barChart: "Gráfico de Barras",
					pieChart: "Gráfico de Pastel",
					sentEmails: "Correos Enviados",
					count: "Cantidad",
					emails: "correo(s)"
				},
				stats: {
					totalSent: "Total Enviados",
					totalScheduled: "Total Programados",
					successRate: "Tasa de Éxito",
					averagePerDay: "Promedio por Día",
					delivered: "entregado(s)",
					pending: "pendiente(s)",
					failed: "falla(s)",
					last30Days: "últimos 30 días"
				},
				table: {
					subject: "Asunto",
					recipient: "Destinatario",
					sentAt: "Enviado en",
					scheduledFor: "Programado para",
					status: "Estado",
					actions: "Acciones"
				},
				emailDetails: {
					title: "Detalles del Correo",
					overview: "Visión General",
					content: "Contenido",
					technical: "Técnico",
					subject: "Asunto",
					recipient: "Destinatario",
					sentAt: "Enviado en",
					scheduledFor: "Programado para",
					createdAt: "Creado en",
					updatedAt: "Actualizado en",
					error: "Error",
					message: "Mensaje",
					attachments: "Adjuntos",
					attachmentsPlaceholder: "Vista previa de adjuntos no disponible",
					emailId: "ID del Correo",
					companyId: "ID de la Empresa",
					messageId: "ID del Mensaje",
					hasAttachments: "Con Adjuntos",
					scheduled: "Programado"
				},
				ariaLabels: {
					dashboard: "Panel de Correo",
					tabs: "Pestañas de Correo",
					sendTab: "Pestaña Enviar Correo",
					scheduleTab: "Pestaña Programar Correo",
					listTab: "Pestaña Listar Correos",
					removeAttachment: "Eliminar adjunto",
					sender: "Campo de Destinatario",
					subject: "Campo de Asunto",
					message: "Campo de Mensaje",
					sendAt: "Campo de Fecha de Envío",
					viewEmail: "Ver Correo",
					moreOptions: "Más Opciones",
					emailLists: "Listas de Correo",
					closeDetails: "Cerrar Detalles",
					detailTabs: "Pestañas de Detalles",
					overviewTab: "Pestaña de Visión General",
					contentTab: "Pestaña de Contenido",
					technicalTab: "Pestaña Técnica"
				}
			},
			success: {
				emailSent: "¡Correo enviado con éxito!",
				emailScheduled: "¡Email agendado con éxito!",
				emailCancelled: "¡Agendamiento cancelado con éxito!",
				emailRescheduled: "¡Email reagendado con éxito!"
			},
			todoList: {
				title: "Mis Tareas",
				tasksCompleted: "{{completed}} de {{total}} tareas completas",
				searchPlaceholder: "Buscar tareas...",
				noCategory: "Sin Categoría",
				menu: {
					markAsDone: "Marcar como completada",
					pin: "Fijar",
					select: "Seleccionar",
					taskDetails: "Detalles de la tarea",
					readAloud: "Leer en voz alta",
					share: "Compartir",
					edit: "Editar",
					duplicate: "Duplicar",
					delete: "Eliminar"
				},
				success: {
					taskAdded: "¡Tarea añadida con éxito!",
					taskUpdated: "¡Tarea actualizada con éxito!",
					taskDeleted: "¡Tarea eliminada con éxito!",
					taskStatusUpdated: "¡Estado de la tarea actualizado con éxito!",
					categoryAdded: "¡Categoría añadida con éxito!",
					categoryUpdated: "¡Categoría actualizada con éxito!",
					categoryDeleted: "¡Categoría eliminada con éxito!"
				},
				errors: {
					fetchTasks: "Error al buscar tareas. Por favor, inténtelo de nuevo.",
					fetchCategories: "Error al buscar categorías. Por favor, inténtelo de nuevo.",
					addTask: "Error al añadir tarea. Por favor, inténtelo de nuevo.",
					updateTask: "Error al actualizar tarea. Por favor, inténtelo de nuevo.",
					deleteTask: "Error al eliminar tarea. Por favor, inténtelo de nuevo.",
					updateTaskStatus: "Error al actualizar estado de la tarea. Por favor, inténtelo de nuevo.",
					addCategory: "Error al añadir categoría. Por favor, inténtelo de nuevo.",
					updateCategory: "Error al actualizar categoría. Por favor, inténtelo de nuevo.",
					deleteCategory: "Error al eliminar categoría. Por favor, inténtelo de nuevo."
				},
				modal: {
					addTask: "Añadir Tarea",
					editTask: "Editar Tarea",
					addCategory: "Añadir Categoría",
					editCategory: "Editar Categoría",
					title: "Título",
					description: "Descripción",
					category: "Categoría",
					dueDate: "Fecha de vencimiento",
					save: "Guardar",
					cancel: "Cancelar"
				}
			},
			taskCharges: {
				chargesManagement: "Gestión de Cobros",
				pendingCharges: "Cobros Pendientes",
				paidCharges: "Cobros Pagados",
				client: "Cliente",
				allClients: "Todos los clientes",
				startDate: "Fecha inicial",
				endDate: "Fecha final",
				task: "Tarea",
				value: "Valor",
				dueDate: "Vencimiento",
				employer: "Empresa",
				chargesByEmployer: "Cobros por Empresas",
				noEmployerWarning: "Esta tarea no tiene empresa asignada.",
				paymentDate: "Fecha de pago",
				actions: "Acciones",
				noPendingCharges: "No hay cobros pendientes",
				noPaidCharges: "No hay cobros pagados",
				noClient: "Cliente no informado",
				noDueDate: "Sin fecha de vencimiento",
				generatePDF: "Generar PDF",
				sendEmail: "Enviar por Email",
				registerPayment: "Registrar Pago",
				pdfGenerated: "PDF generado con éxito",
				emailSent: "Email enviado con éxito",
				paymentRegistered: "Pago registrado con éxito",
				errorLoadingCharges: "Error al cargar cobros",
				errorGeneratingPDF: "Error al generar PDF",
				errorSendingEmail: "Error al enviar email",
				errorRegisteringPayment: "Error al registrar pago",
				rowsPerPage: "Elementos por página",
				of: "de",
				financialReport: "Informe Financiero",
				report: "Informe",
				totalValue: "Valor Total",
				pendingValue: "Valor Pendiente",
				paidValue: "Valor Recibido",
				paidInPeriod: "Recibido en el Período",
				charges: "cobros",
				chargesByClient: "Cobros por Cliente",
				chargesByMonth: "Cobros por Mes",
				paymentsVsCharges: "Cobros vs. Pagos",
				payments: "Pagos",
				noDataAvailable: "No hay datos disponibles",
				selectFiltersAndSearch: "Seleccione los filtros y haga clic en buscar",
				errorLoadingReport: "Error al cargar informe",
				paymentNotes: "Observaciones de Pago",
				paymentNotesPlaceholder: "Proporcione detalles adicionales sobre el pago (opcional)",
				sendReceipt: "Enviar recibo por email",
				title: "Información de Cobro",
				addChargeDescription: "Agregue un cobro para esta tarea. Una vez agregado, podrá generar PDFs, enviar por email y registrar pagos.",
				addCharge: "Añadir Cobro",
				noClientWarning: "Atención: Esta tarea no tiene un cliente asociado. Considere agregar un cliente para facilitar la gestión del cobro.",
				status: "Situation",
				paid: "Pagado",
				pending: "Pendiente",
				notes: "Observaciones",
				invalidValue: "Valor inválido. Ingrese un valor mayor que cero.",
				chargeAdded: "Cobro añadido con éxito",
				errorAddingCharge: "Error al agregar cobro",
				noEmailWarning: "No hay correo electrónico de contacto para enviar. Agregue un correo electrónico al cliente o solicitante."
			},
			taskSubjects: {
				manageSubjects: "Gestionar Asuntos",
				subjectName: "Asunto",
				subjectDescription: "Descripción",
				subjectsList: "Asuntos existentes",
				noSubjects: "Ningún asunto registrado",
				errorLoading: "Se produjo un error al cargar los asuntos"
			},
			tasks: {
				title: "Tareas",
				search: "Buscar",
				from: "De",
				to: "Hasta",
				startDate: "Fecha Inicial",
				endDate: "Fecha Final",
				dueDate: "Fecha de Vencimiento",
				creator: "Creador",
				responsible: "Responsable",
				category: "Categoría",
				subject: "Asunto",
				allUsers: "Todos",
				allCategories: "Todas",
				allStatuses: "Todos",
				allEmployers: "Todas las empresas",
				allOptions: "Todas",
				status: {
					title: "Estado",
					pending: "Pendiente",
					inProgress: "En Progreso",
					completed: "Completada",
					overdue: "Atrasada"
				},
				privateTask: "Tarea privada (solo tú puedes ver)",
				private: "Privada",
				public: "Pública",
				paid: "Pagado",
				pending: "Pendiente",
				createdAt: "Creada en",
				lastUpdate: "Última Actualización",
				privacy: "Privacidad",
				charge: "Cobro",
				recurrence: {
					title: "Recurrencia",
					daily: "Diaria",
					weekly: "Semanal",
					biweekly: "Quincenal",
					monthly: "Mensual",
					quarterly: "Trimestral",
					semiannual: "Semestral",
					annual: "Anual"
				},
				description: "Descripción",
				today: "Hoy",
				tomorrow: "Mañana",
				dueToday: "Vence hoy",
				dueTomorrow: "Vence mañana",
				daysOverdue: "Atrasada en {{days}} días",
				dueYesterday: "Venció ayer",
				overdueDays: "Atrasada en {{days}} días",
				dueInDays: "Vence en {{days}} días",
				withAttachments: "Con adjuntos",
				employer: "Empresa",
				employerName: "Nombre de la Empresa",
				employerEmail: "Correo electrónico de la empresa",
				employerPhone: "Teléfono de la empresa",
				employerDetails: "Detalles de la Empresa",
				requesterName: "Nombre del solicitante",
				requesterEmail: "Correo electrónico del solicitante",
				requesterDetails: "Detalles del solicitante",
				chargeValue: "Valor del cobro",
				chargeStatus: "Estado del pago",
				paymentDate: "Fecha de pago",
				paymentNotes: "Observaciones de Pago",
				paidBy: "Registrado por",
				viewInvoice: "Ver Factura",
				additionalInfo: "Informaciones Adicionales",
				recurrenceType: "Tipo de Recurrencia",
				recurrenceDetails: "Detalles de Recurrencia",
				recurrenceEndDate: "Fecha de Término",
				recurrenceCount: "Cantidad de Ocurrencias",
				nextOccurrence: "Próxima Ocurrencia",
				hasNotes: "{{count}} notas",
				hasAttachments: "{{count}} adjuntos",
				buttons: {
					add: "Añadir Tarea",
					edit: "Editar",
					delete: "Eliminar",
					save: "Guardar",
					saving: "Guardando...",
					cancel: "Cancelar",
					close: "Cerrar",
					refresh: "Actualizar",
					clearFilters: "Limpiar filtros",
					filter: "Filtrar",
					clear: "Limpiar filtros",
					markDone: "Marcar como Completada",
					markInProgress: "Marcar como en progreso",
					showDeleted: "Mostrar excluidas",
					markPending: "Marcar como Pendiente",
					toggleFilters: "Mostrar/Ocultar Filtros",
					kanbanView: "Vista Kanban",
					listView: "Vista en Lista",
					reports: "Informes",
					finances: "Finanzas",
					sort: "Ordenar",
					moreActions: "Más Acciones",
					options: "Opciones",
					print: "Imprimir",
					export: "Exportar"
				},
				tabs: {
					all: "Todas",
					pending: "Pendientes",
					inProgress: "En Progreso",
					completed: "Completadas",
					paid: "Cobradas",
					unpaid: "En Cobro",
					recurrent: "Recurrentes",
					notes: "Notas",
					attachments: "Adjuntos",
					timeline: "Línea de Tiempo",
					charges: "Cobranzas",
					details: "Detalles",
					deleted: "Eliminadas"
				},
				columns: {
					title: "Título",
					status: "Estado",
					dueDate: "Vencimiento",
					responsible: "Responsable",
					category: "Categoría",
					actions: "Acciones"
				},
				empty: {
					title: "No se encontraron tareas",
					description: "Haga clic en el botón de abajo para agregar una nueva tarea",
					noTasks: "No se encontraron tareas"
				},
				form: {
					title: "Título",
					description: "Descripción",
					dueDate: "Fecha de Vencimiento",
					category: "Categoría",
					assignmentType: "Tipo de Asignación",
					responsible: "Responsable",
					individual: "Individual",
					group: "Grupo",
					groupUsers: "Usuarios del Grupo",
					selectCategory: "Seleccione una categoría",
					selectResponsible: "Seleccione un responsable",
					selectField: "Seleccione un campo",
					completed: "Completada",
					titleRequired: "El título es obligatorio",
					categoryRequired: "La categoría es obligatoria",
					userRequired: "El responsable es obligatorio",
					usersRequired: "Seleccione al menos un usuario",
					private: "Privada",
					privateInfo: "Solo usted podrá ver esta tarea",
					employer: "Empresa",
					subject: "Asunto",
					selectSubject: "Seleccione un asunto",
					requesterName: "Nombre del solicitante",
					requesterEmail: "Correo electrónico del solicitante",
					chargeInfo: "Información de Cobro",
					hasCharge: "Esta tarea tiene una cobranza",
					chargeValue: "Valor",
					chargeValueRequired: "El valor de la cobranza es obligatorio",
					isPaid: "Cobranza realizada",
					paymentDate: "Fecha de pago",
					paymentNotes: "Observaciones de Pago",
					recurrenceTitle: "Recurrencia",
					recurrenceInfo: "Puede definir un final por fecha o cantidad de ocurrencias. Si ambos están completos, se considerará lo que ocurra primero.",
					isRecurrent: "Esta tarea es recurrente",
					recurrenceType: "Periodicidad",
					recurrenceTypeRequired: "El tipo de recurrencia es obligatorio",
					recurrenceEndDate: "Fecha de Término",
					recurrenceCount: "Cantidad de Ocurrencias"
				},
				modal: {
					add: "Añadir Tarea",
					edit: "Editar Tarea",
					loadError: "Error al cargar los datos"
				},
				notifications: {
					created: "Tarea creada con éxito",
					updated: "Tarea actualizada con éxito",
					deleted: "Tarea eliminada con éxito",
					statusUpdated: "Estado actualizado con éxito",
					titleRequired: "El título es obligatorio",
					categoryRequired: "La categoría es obligatoria",
					userRequired: "El responsable es obligatorio",
					usersRequired: "Seleccione al menos un usuario",
					chargeValueRequired: "El valor de la cobranza es obligatorio",
					recurrenceTypeRequired: "El tipo de recurrencia es obligatorio",
					submitError: "Error al guardar la tarea",
					updateError: "Error al actualizar la tarea",
					deleteError: "Error al eliminar la tarea"
				},
				confirmations: {
					delete: {
						title: "Confirmar eliminación",
						message: "¿Está seguro de que desea eliminar esta tarea?"
					}
				},
				sort: {
					dueDate: "Fecha de Vencimiento",
					title: "Título",
					category: "Categoría"
				},
				errors: {
					loadFailed: "Error al cargar las tareas"
				},
				indicators: {
					notes: "{{count}} notas",
					attachments: "{{count}} adjuntos",
					paid: "Pagado: R$ {{value}}",
					pendingPayment: "Pendiente: R$ {{value}}",
					recurrent: "Tarea recurrente"
				},
				kanban: {
					statusMode: "Por Estado",
					categoryMode: "Por Categoría",
					todo: "Por Hacer",
					inProgress: "En Progreso",
					done: "Completadas",
					emptyColumn: "No hay tareas en esta columna",
					emptyCategoryColumn: "No hay tareas en esta categoría",
					filters: "Filtros",
					clearFilters: "Limpiar Filtros",
					loadError: "Error al cargar los datos del Kanban",
					noCategories: "No se encontraron categorías"
				},
				timeline: {
					system: "Sistema",
					fetchError: "Error al cargar el historial de la tarea",
					noEvents: "No se registraron eventos para esta tarea",
					taskCreated: "{{name}} creó la tarea '{{title}}'",
					taskUpdated: "{{name}} actualizó la tarea",
					taskDeleted: "{{name}} eliminó la tarea",
					noteAdded: "{{name}} agregó una nota",
					noteUpdated: "{{name}} actualizó una nota",
					noteDeleted: "{{name}} eliminó una nota",
					attachmentAdded: "{{name}} adjuntó el archivo '{{filename}}'",
					attachmentDeleted: "{{name}} eliminó el adjunto '{{filename}}'",
					statusCompletedBy: "{{name}} marcó la tarea como completada",
					statusPendingBy: "{{name}} marcó la tarea como pendiente",
					responsibleChanged: "{{name}} cambió el responsable de {{oldResponsible}} a {{newResponsible}}",
					usersAdded: "{{name}} agregó {{count}} usuarios a la tarea",
					userRemoved: "{{name}} eliminó a {{removed}} de la tarea",
					categoryChanged: "{{name}} cambió la categoría a '{{category}}'",
					dueDateChanged: "{{name}} cambió la fecha de vencimiento a {{date}}",
					noDate: "sin fecha",
					titleChanged: "{{name}} cambió el título a '{{title}}'",
					descriptionChanged: "{{name}} actualizó la descripción de la tarea",
					employerAssociated: "{{name}} asoció la empresa '{{employer}}' a la tarea",
					employerChanged: "{{name}} cambió la empresa asociada a la tarea",
					subjectAssociated: "{{name}} asoció el asunto '{{subject}}' a la tarea",
					subjectChanged: "{{name}} cambió el asunto de la tarea",
					chargeAdded: "{{name}} agregó un cargo de {{value}}",
					paymentRegistered: "{{name}} registró el pago de {{value}} en {{date}}",
					chargeEmailSent: "{{name}} envió un correo de cobro a {{email}}",
					receiptEmailSent: "{{name}} envió un recibo por correo a {{email}}",
					chargePdfGenerated: "{{name}} generó un PDF del cobro",
					notificationSent: "{{name}} envió una notificación a través de {{type}}",
					notificationFailed: "{{name}} - error al enviar la notificación: {{reason}}",
					overdueNotificationSent: "{{name}} recibió una notificación de retraso ({{minutes}} min)",
					recurrenceConfigured: "{{name}} configuró la recurrencia de tipo {{type}}",
					recurrenceCreated: "{{name}} creó una nueva instancia recurrente (#{{childId}})",
					recurrenceChildCreated: "{{name}} creó una tarea basada en el patrón #{{parentId}}",
					recurrenceLimitReached: "{{name}} - límite de recurrencias alcanzado ({{count}})",
					recurrenceEndDateReached: "{{name}} - fecha final de recurrencia alcanzada ({{date}})",
					recurrenceSeriesUpdated: "{{name}} actualizó la serie de tareas recurrentes ({{fields}})",
					recurrenceSeriesDeleted: "{{name}} eliminó {{count}} tareas de la serie recurrente",
					reportGenerated: "{{name}} generó un informe de tipo {{type}}",
					financialReportGenerated: "{{name}} generó un informe financiero"
				},
				notes: {
					placeholder: "Agregar una nota...",
					empty: "No se encontraron notas",
					deleted: "Nota eliminada exitosamente",
					deleteError: "Error al eliminar la nota"
				},
				attachments: {
					title: "Adjuntos",
					dropFiles: "Arrastre archivos aquí o haga clic para cargar",
					clickToUpload: "Formatos: PDF, JPEG, PNG, DOC, XLS",
					allowedTypes: "Tamaño máximo: 10MB",
					uploading: "Enviando archivo...",
					uploaded: "Archivo enviado exitosamente",
					deleted: "Archivo eliminado exitosamente",
					empty: "No se encontraron adjuntos",
					fileTooLarge: "El archivo excede el tamaño máximo permitido ({{size}})",
					fileTypeNotAllowed: "Tipo de archivo no permitido",
					errorLoadingFiles: "Error al cargar archivos",
					preview: "Previsualización",
					clickToPreview: "Haga clic para visualizar",
					uploadedBy: "Enviado por",
					sort: {
						newest: "Más recientes",
						oldest: "Más antiguos",
						nameAsc: "Nombre (A-Z)",
						nameDesc: "Nombre (Z-A)",
						sizeAsc: "Tamaño (menor primero)",
						sizeDesc: "Tamaño (mayor primero)"
					}
				},
				reports: {
					title: "Informes de Tareas",
					filters: "Filtros",
					totalTasks: "Total de Tareas",
					completed: "Completadas",
					pending: "Pendientes",
					overdue: "Atrasadas",
					weeklyProgress: "Progreso Semanal",
					statusDistribution: "Distribución de Estado",
					userPerformance: "Rendimiento por Usuario",
					attachmentStats: "Estadísticas de Adjuntos",
					noDataAvailable: "No hay datos disponibles"
				},
				export: {
					success: "Exportación completada exitosamente",
					error: "Error al exportar datos",
					downloadTemplate: "Descargar modelo",
					noData: "No hay tareas para exportar"
				},
				import: {
					title: "Importar Tareas",
					steps: {
						selectFile: "Seleccionar Archivo",
						mapFields: "Mapear Campos",
						review: "Revisar",
						result: "Resultado"
					},
					selectFilePrompt: "Seleccione un archivo CSV o Excel con las tareas para importar",
					dragAndDrop: "Arrastre y suelte el archivo aquí",
					or: "o",
					browse: "Buscar archivo",
					supportedFormats: "Formatos admitidos: CSV, XLSX, XLS",
					needTemplate: "¿Necesitas un modelo para empezar?",
					downloadTemplate: "Descargar modelo de importación",
					processingFile: "Procesando archivo...",
					mapFields: "Mapee los campos de su archivo a los campos del sistema",
					mapFieldsInfo: "Seleccione qué columnas de su archivo corresponden a cada campo en el sistema. Solo el campo 'Título' es obligatorio.",
					selectField: "Seleccione un campo",
					validation: {
						titleRequired: "El campo 'Título' es obligatorio para la importación",
						emptyTitle: "Título vacío",
						invalidDate: "Fecha inválida: {{value}}",
						invalidCategory: "Categoría '{{category}}' no encontrada",
						invalidUser: "Usuario '{{user}}' no encontrado",
						dataErrors: "{{count}} registros con problemas"
					},
					validationErrors: "{{count}} problemas encontrados en los datos",
					errorDetails: "Detalles de los errores ({{count}})",
					rowError: "Línea {{row}}: {{error}}",
					moreErrors: "...y {{count}} errores más",
					reviewAndImport: "Revise los datos e inicie la importación",
					reviewInfo: "Verifique los datos a continuación antes de importar. Podrá ver un resumen y una muestra de los datos que se importarán.",
					summary: "Resumen",
					totalRecords: "Total de registros",
					validRecords: "Registros válidos",
					invalidRecords: "Registros inválidos",
					mappedFields: "Campos mapeados",
					notMapped: "No mapeado",
					previewData: "Previsualización",
					showingFirst: "Mostrando los primeros {{count}} de {{total}} registros",
					import: "Importar",
					importingTasks: "Importando tareas...",
					pleaseWait: "Por favor, espere mientras se importan las tareas",
					importComplete: "Importación completada",
					importFailed: "Fallo en la importación",
					totalProcessed: "Total procesado",
					successful: "Éxito",
					failed: "Fallo",
					errors: {
						invalidFileType: "Tipo de archivo inválido. Use CSV o Excel.",
						emptyFile: "Archivo vacío o sin datos",
						parsingFailed: "Error al procesar el archivo",
						readFailed: "Error al leer el archivo",
						processingFailed: "Error al procesar los datos",
						validationFailed: "Hay errores en la validación de los datos",
						importFailed: "Fallo al importar datos",
						generalError: "Error desconocido",
						fetchCategoriesFailed: "Error al cargar categorías",
						fetchUsersFailed: "Error al cargar usuarios",
						templateGenerationFailed: "Error al generar el modelo"
					},
					successMessage: "{{count}} tareas se importaron con éxito",
					failureMessage: "La importación falló. Verifique los errores e inténtelo de nuevo.",
					importAnother: "Importar otro archivo"
				},
				charges: {
					title: "Gestionar Cobros",
					pendingCharges: "Cobros Pendientes",
					paidCharges: "Cobros Pagados",
					employer: "Empresa",
					allEmployers: "Todas las empresas",
					value: "Valor",
					dueDate: "Fecha de Vencimiento",
					paymentDate: "Fecha de pago",
					actions: "Acciones",
					task: "Tarea",
					status: "Estado",
					generatePDF: "Generar PDF",
					sendEmail: "Enviar Email",
					registerPayment: "Registrar Pago",
					addCharge: "Añadir Cobro",
					addChargeDescription: "Agregue un cobro a esta tarea completando el valor a continuación.",
					noEmployerWarning: "Atención: Ninguna empresa definida para esta tarea. Los cobros sin empresa pueden dificultar el seguimiento.",
					noEmailWarning: "No hay correo electrónico de contacto para enviar el cobro.",
					pdfGenerated: "PDF generado con éxito",
					emailSent: "Email enviado con éxito",
					paymentRegistered: "Pago registrado con éxito",
					notes: "Observaciones",
					paid: "Pagado",
					pending: "Pendiente",
					invalidValue: "Valor inválido",
					paymentNotesPlaceholder: "Información adicional sobre el pago...",
					sendReceipt: "Enviar recibo al cliente",
					noPendingCharges: "No se encontraron cobros pendientes",
					noPaidCharges: "No se encontraron cobros pagados",
					noEmployer: "Sin empresa",
					noDueDate: "Sin fecha de vencimiento",
					rowsPerPage: "Líneas por página",
					of: "de",
					financialReport: "Informe Financiero",
					report: "Informe",
					paidInPeriod: "Pagado en el período",
					totalValue: "Valor Total",
					pendingValue: "Valor Pendiente",
					paidValue: "Valor Pagado",
					charges: "cobros",
					selectFiltersAndSearch: "Seleccione los filtros y haga clic en Buscar",
					noDataAvailable: "Sin datos disponibles",
					chargesByEmployer: "Cobros por Empresa",
					chargesByMonth: "Cobros por Mes",
					paymentsVsCharges: "Cobros vs. Pagos",
					payments: "Pagos"
				},
				financialReports: {
					title: "Informes Financieros"
				},
				filters: {
					title: "Filtros",
					charges: "Cobranzas",
					withCharges: "Con Cobros",
					paid: "Pagados",
					pending: "Pendientes",
					hasAttachments: "Solo con adjuntos",
					recurrent: "Solo tareas recurrentes",
					loadError: "Error al cargar datos de filtro"
				},
				taskCategories: {
					manageCategories: "Gestionar Categorías",
					categoryName: "Nombre de la Categoría",
					nameRequired: "El nombre de la categoría es obligatorio",
					categoryCreated: "Categoría creada con éxito",
					categoryUpdated: "Categoría actualizada con éxito",
					categoryDeleted: "Categoría eliminada exitosamente",
					confirmDelete: "¿Está seguro de que desea eliminar esta categoría?",
					noCategories: "No se encontraron categorías",
					errorLoading: "Error al cargar categorías",
					errorSaving: "Error al guardar la categoría",
					errorDeleting: "Error al eliminar la categoría",
					cannotDeleteUsed: "No se puede eliminar esta categoría porque está siendo utilizada en tareas",
					tasks: "tareas"
				},
				taskSubjects: {
					manageSubjects: "Gestionar Asuntos",
					subjectName: "Nombre del Asunto",
					subjectDescription: "Descripción (opcional)",
					nameRequired: "El nombre del asunto es obligatorio",
					subjectCreated: "Asunto creado exitosamente",
					subjectUpdated: "Asunto actualizado exitosamente",
					subjectDeleted: "Asunto eliminado exitosamente",
					confirmDelete: "¿Está seguro de que desea eliminar este asunto?",
					noSubjects: "Ningún asunto registrado",
					subjectsList: "Lista de Asuntos",
					noDescription: "Sin descripción",
					errorLoading: "Error al cargar los asuntos",
					errorSaving: "Error al guardar el asunto",
					errorDeleting: "Error al eliminar el asunto",
					cannotDeleteUsed: "No se puede eliminar este asunto porque está siendo utilizado en tareas"
				},
				toggleView: "Alternar vista",
				toggleFilters: "Mostrar/Ocultar Filtros",
				help: {
					tooltip: "Ayuda sobre la Gestión de Tareas",
					title: "Ayuda - Gestión de Tareas",
					tabs: {
						overview: "Visión General",
						interface: "Interfaz",
						features: "Funcionalidades",
						kanban: "Kanban",
						financial: "Financiero",
						tips: "Consejos"
					},
					overview: {
						title: "Visión General del Módulo de Tareas",
						introduction: "El módulo de Tareas permite gestionar todas las actividades de su equipo de manera organizada y eficiente. Aquí puede crear, asignar, seguir y completar tareas, además de generar informes y facturas.",
						mainFeatures: "Principales Funcionalidades:",
						listView: "Vista en Lista",
						listViewDesc: "Visualice sus tareas en una lista detallada con filtros y ordenación.",
						kanbanView: "Vista Kanban",
						kanbanViewDesc: "Gestione tareas en un tablero de estado o por categorías.",
						financial: "Gestión Financiera",
						financialDesc: "Cree facturas asociadas a las tareas y haga seguimiento de los pagos.",
						reports: "Informes y Estadísticas",
						reportsDesc: "Siga el rendimiento con informes detallados y gráficos.",
						benefits: "Beneficios:",
						benefitsText: "Con la gestión de tareas, su equipo podrá trabajar de manera más organizada, seguir plazos, evitar olvidos, mantener un historial de actividades y facilitar la rendición de cuentas a sus clientes. Las facturas automáticas permiten optimizar el proceso financiero, mientras que los informes proporcionan información valiosa para la gestión."
					},
					interface: {
						title: "Interfaz y Navegación",
						headerSection: "Encabezado y Barra de Herramientas",
						headerDesc: "En la parte superior de la página, encontrará:",
						searchField: "Campo de Búsqueda",
						searchFieldDesc: "Busque tareas por título o información relacionada",
						filterButton: "Botón de Filtros",
						filterButtonDesc: "Muestra/oculta el panel de filtros avanzados",
						reportButton: "Botón de Informes",
						reportButtonDesc: "Accede a la sección de informes y estadísticas",
						financialButton: "Botón Financiero",
						financialButtonDesc: "Menú con opciones para gestionar facturas",
						viewToggle: "Conmutador de Vista",
						viewToggleDesc: "Alterna entre vista de lista y kanban",
						addButton: "Botón Agregar",
						addButtonDesc: "Crea una nueva tarea",
						tabsSection: "Pestañas de Estado",
						tabsDesc: "Las pestañas permiten filtrar rápidamente las tareas por estado:",
						allTab: "Todas",
						allTabDesc: "Muestra todas las tareas",
						pendingTab: "Pendientes",
						pendingTabDesc: "Tareas que aún no han sido completadas",
						inProgressTab: "En Progreso",
						inProgressTabDesc: "Tareas que se están trabajando",
						completedTab: "Completadas",
						completedTabDesc: "Tareas finalizadas",
						paidTab: "Pagados",
						paidTabDesc: "Tareas con factura pagada",
						unpaidTab: "No Pagadas",
						unpaidTabDesc: "Tareas con factura pendiente de pago",
						recurrentTab: "Recurrentes",
						recurrentTabDesc: "Tareas que se repiten automáticamente",
						tableSection: "Tabla de Tareas",
						tableDesc: "La tabla muestra sus tareas con las siguientes columnas:",
						titleColumn: "Título",
						titleColumnDesc: "Nombre de la tarea con indicadores de adjuntos y notas",
						statusColumn: "Estado",
						statusColumnDesc: "Estado actual de la tarea (Pendiente, En Progreso, Completada, Atrasada)",
						dueDateColumn: "Fecha de Vencimiento",
						dueDateColumnDesc: "Plazo para completar la tarea",
						responsibleColumn: "Responsable",
						responsibleColumnDesc: "Usuario designado para ejecutar la tarea",
						categoryColumn: "Categoría",
						categoryColumnDesc: "Clasificación de la tarea",
						actionsColumn: "Acciones",
						actionsColumnDesc: "Botones para marcar como completada, editar y eliminar"
					},
					features: {
						title: "Funcionalidades Detalladas",
						taskCreation: "Creación y Edición de Tareas",
						taskCreationDesc: "Para crear una nueva tarea, haga clic en el botón 'Agregar' en la esquina superior derecha. El formulario permite configurar:",
						basicInfo: "Informaciones Básicas",
						basicInfoDesc: "Título, descripción, fecha de vencimiento, categoría y asunto",
						responsibility: "Responsabilidad",
						responsibilityDesc: "Asignación individual o en grupo para múltiples usuarios",
						clientInfo: "Información del Cliente",
						clientInfoDesc: "Vinculación a una empresa y datos del solicitante",
						charging: "Configuración de Facturación",
						chargingDesc: "Establezca el valor y estado de pago",
						recurrence: "Configuración de Recurrencia",
						recurrenceDesc: "Establezca la periodicidad, fecha de finalización o número de ocurrencias",
						taskEditingNote: "La edición de tareas utiliza el mismo formulario, lo que permite cambiar cualquier parámetro en cualquier momento.",
						filtering: "Filtros Avanzados",
						filteringDesc: "El panel de filtros permite refinar su visualización según diversos criterios:",
						dateFilter: "Filtros de Fecha",
						dateFilterDesc: "Período específico con fecha inicial y final",
						userFilter: "Filtro por Usuario",
						userFilterDesc: "Tareas asignadas a un responsable específico",
						categoryFilter: "Filtro por Categoría",
						categoryFilterDesc: "Tareas de una categoría específica",
						employerFilter: "Filtro por Empresa",
						employerFilterDesc: "Tareas asociadas a una empresa específica",
						statusFilter: "Filtro por Estado",
						statusFilterDesc: "Pendientes, completadas, en progreso o atrasadas",
						chargeFilter: "Filtro por Facturación",
						chargeFilterDesc: "Tareas con facturación, pagadas o pendientes",
						attachmentFilter: "Filtro por Adjuntos",
						attachmentFilterDesc: "Tareas que tienen adjuntos",
						recurrenceFilter: "Filtro por Recurrencia",
						recurrenceFilterDesc: "Solo tareas recurrentes",
						sorting: "Ordenación y Organización",
						sortingDesc: "Además de los filtros, es posible ordenar las tareas según diversos criterios:",
						dueDateSort: "Fecha de Vencimiento",
						dueDateSortDesc: "Prioriza tareas por plazo",
						titleSort: "Título",
						titleSortDesc: "Ordena alfabéticamente por título",
						categorySort: "Categoría",
						categorySortDesc: "Agrupa tareas por categoría",
						importExport: "Importación y Exportación",
						importDesc: "La funcionalidad de importación permite cargar múltiples tareas a la vez a través de archivos CSV o Excel:",
						importSteps: "Etapas de la Importación",
						importStepsDesc: "Carga del archivo, mapeo de campos, revisión y confirmación",
						exportFormats: "Formatos de Exportación",
						exportFormatsDesc: "Exporte sus tareas en PDF, Excel o imprima directamente",
						categories: "Categorías y Asuntos",
						categoriesDesc: "El sistema permite gestionar categorías y asuntos para una mejor organización:",
						categoryManagement: "Gestión de Categorías",
						categoryManagementDesc: "Cree, edite y elimine categorías para clasificar sus tareas",
						subjectManagement: "Gestión de Asuntos",
						subjectManagementDesc: "Configure asuntos para agregar una segunda dimensión de clasificación",
						details: "Detalles de la Tarea",
						detailsDesc: "Al hacer clic en una tarea, accede al modal de detalles con diversas pestañas:",
						notesTab: "Notas",
						notesTabDesc: "Agregue notas para documentar el progreso",
						attachmentsTab: "Adjuntos",
						attachmentsTabDesc: "Suba archivos relacionados con la tarea",
						timelineTab: "Línea de Tiempo",
						timelineTabDesc: "Visualice todo el historial de acciones de la tarea",
						chargesTab: "Cobranzas",
						chargesTabDesc: "Gestione valores y pagos asociados a la tarea",
						detailsTab: "Detalles",
						detailsTabDesc: "Información completa sobre empresa, solicitante y configuraciones"
					},
					kanban: {
						title: "Vista Kanban",
						introduction: "La visualización Kanban ofrece una perspectiva visual del flujo de trabajo, permitiendo gestionar tareas a través de columnas que representan diferentes estados o categorías.",
						modes: "Modos de Visualización",
						modesDesc: "El Kanban ofrece dos modos principales de visualización:",
						statusMode: "Por Estado",
						statusModeDesc: "Organiza las tareas en columnas de Pendiente, En Progreso y Completado",
						categoryMode: "Por Categoría",
						categoryModeDesc: "Agrupa tareas por categoría, permitiendo visualizar la distribución del trabajo",
						dragDrop: "Arrastrar y Soltar",
						dragDropDesc: "La principal ventaja del Kanban es la funcionalidad de arrastrar y soltar:",
						statusChange: "Cambio de Estado",
						statusChangeDesc: "En el modo Estado, arrastre tareas entre columnas para cambiar su estado",
						categoryChange: "Cambio de Categoría",
						categoryChangeDesc: "En el modo Categoría, arrastre para reclasificar la tarea",
						dragDropTip: "Consejo: Para cambiar varias tareas rápidamente, utilice la visualización Kanban en lugar de abrir y editar cada tarea individualmente.",
						filtering: "Filtrado en Kanban",
						filteringDesc: "Incluso en la visualización Kanban, puede utilizar los filtros avanzados:",
						filterAccess: "Acceso a los Filtros",
						filterAccessDesc: "Haga clic en el ícono de filtro para mostrar/ocultar el panel de filtros",
						filterEffect: "Efecto de los Filtros",
						filterEffectDesc: "Los filtros afectan a todas las columnas simultáneamente, mostrando solo las tareas que cumplen con los criterios",
						cards: "Tarjetas de Tareas",
						cardsDesc: "Las tarjetas en Kanban muestran información importante de forma compacta:",
						cardInfo: "Informaciones Visibles",
						cardInfoDesc: "Título, responsable, fecha de vencimiento, categoría e indicadores de adjuntos/notas",
						cardActions: "Acciones Rápidas",
						cardActionsDesc: "Botones para marcar como completada, editar y eliminar directamente en la tarjeta",
						cardClick: "Haga clic en la Tarjeta",
						cardClickDesc: "Haga clic en cualquier tarjeta para abrir los detalles completos de la tarea"
					},
					financial: {
						title: "Gestión Financiera",
						introduction: "El módulo de tareas ofrece funcionalidades financieras integradas, permitiendo crear facturaciones asociadas a tareas, gestionar pagos y generar informes financieros.",
						taskCharges: "Facturación en Tareas",
						taskChargesDesc: "Cómo agregar facturaciones a una tarea:",
						createCharge: "Creación de Facturación",
						createChargeDesc: "Al crear o editar una tarea, active la opción 'Esta tarea tiene facturación' en la sección de Informaciones de Facturación",
						chargeSettings: "Configuraciones de Facturación",
						chargeSettingsDesc: "Establezca el valor a cobrar e indique si ya ha sido pagado",
						existingCharge: "Tareas con Facturación",
						existingChargeDesc: "Las tareas con facturación muestran un ícono de cifra. Verde para pagadas, rojo para pendientes",
						chargeManagement: "Gestión de Cobros",
						chargeManagementDesc: "Para gestionar todas las facturaciones en un solo lugar:",
						chargesPage: "Página de Facturaciones",
						chargesPageDesc: "Acceda a través del botón Financiero > Gestionar Facturaciones",
						chargeTabs: "Pestañas de Facturación",
						chargeTabsDesc: "Alterne entre facturaciones pendientes y pagadas",
						chargeActions: "Acciones de Cobro",
						chargeActionsDesc: "Generar PDF, enviar por correo electrónico y registrar pago",
						chargeFilters: "Filtros de Cobro",
						chargeFiltersDesc: "Filtre por empresa, fecha de vencimiento y otros criterios",
						reports: "Informes Financieros",
						reportsDesc: "Siga el desempeño financiero a través de informes:",
						reportAccess: "Acceso a los Informes",
						reportAccessDesc: "Botón Financiero > Informes Financieros",
						reportSummary: "Resumen Financiero",
						reportSummaryDesc: "Visualice totales de cobros, valores pendientes y recibidos",
						reportCharts: "Gráficos Financieros",
						reportChartsDesc: "Analice datos por empresa, por mes y compare cobros con pagos",
						reportFilters: "Personalización de Informes",
						reportFiltersDesc: "Filtre por empresa, período y otros criterios para análisis específicos",
						invoicing: "Facturación y Comunicación",
						invoicingDesc: "Comuníquese con clientes sobre cobros:",
						pdfGeneration: "Generación de PDF",
						pdfGenerationDesc: "Cree documentos de cobro profesionales para enviar a los clientes",
						emailSending: "Envío por Correo Electrónico",
						emailSendingDesc: "Envíe cobros directamente a los clientes a través del sistema",
						receiptSending: "Envío de Recibos",
						receiptSendingDesc: "Después de registrar pagos, envíe recibos automáticos"
					},
					tips: {
						title: "Consejos y Buenas Prácticas",
						organization: "Organización Eficiente",
						useCategories: "Use Categorías Consistentes",
						useCategoriesDesc: "Establezca un conjunto estándar de categorías para facilitar la organización y los informes",
						namingConvention: "Estandarice Títulos",
						namingConventionDesc: "Adopte una convención de nomenclatura para tareas para facilitar la búsqueda (ej: [Cliente] - Acción Principal)",
						useDescription: "Descripciones Detalladas",
						useDescriptionDesc: "Incluya información completa en la descripción para que cualquier persona entienda lo que se debe hacer",
						teamWork: "Trabajo en Equipo",
						useNotes: "Use Notas para Comunicación",
						useNotesDesc: "Documente avances y desafíos en las notas para mantener al equipo informado",
						groupAssignment: "Asignación en Grupo",
						groupAssignmentDesc: "Para tareas complejas, asigne a múltiples usuarios para colaboración",
						attachRelevantFiles: "Adjunte Archivos Relevantes",
						attachRelevantFilesDesc: "Mantenga todos los archivos necesarios adjuntos a la tarea para un fácil acceso",
						timeManagement: "Gestión del Tiempo",
						setRealisticDates: "Establezca Plazos Realistas",
						setRealisticDatesDesc: "Evite plazos imposibles de cumplir para mantener al equipo motivado",
						useInProgress: "Use el Estado 'En Progreso'",
						useInProgressDesc: "Cuando comience a trabajar en una tarea, muévala a 'En Progreso' para una mejor visualización",
						reviewDailyTasks: "Revise Tareas Diariamente",
						reviewDailyTasksDesc: "Comience el día verificando las tareas pendientes y organice la visualización Kanban",
						financialBestPractices: "Buenas Prácticas Financieras",
						linkToEmployer: "Vincule a Empresas",
						linkToEmployerDesc: "Siempre asocie tareas con cobros a empresas para facilitar la facturación",
						regularReports: "Informes Regulares",
						regularReportsDesc: "Genere informes financieros semanales o mensuales para seguir los ingresos",
						documentPayments: "Documente Pagos",
						documentPaymentsDesc: "Al registrar pagos, agregue información detallada en las observaciones",
						kanbanUsage: "Uso Eficiente del Kanban",
						statusModeForWorkflow: "Modo Estado para Flujo de Trabajo",
						statusModeForWorkflowDesc: "Use el modo estado para gestionar tareas en curso en el día a día",
						categoryModeForPlanning: "Modo Categoría para Planificación",
						categoryModeForPlanningDesc: "Use el modo categoría para evaluar la distribución de trabajo y hacer planificación",
						limitWIP: "Limite Trabajo en Curso",
						limitWIPDesc: "Evite tener muchas tareas en progreso simultáneamente para mejorar la productividad"
					}
				}
			},
			taskCategories: {
				manageCategories: "Gestionar Categorías",
				categoryName: "Categoría",
				nameRequired: "El nombre de la categoría es obligatorio",
				noCategories: "Sin Categorías",
				tasks: "Tareas"
			},
			kanban: {
				title: "Tablero Kanban",
				openTickets: "En Abierto",
				queue: {
					title: "Tablero por Sector",
					selectQueue: "Seleccione un sector",
					selectQueuePrompt: "Seleccione un sector para visualizar el tablero kanban",
					newLane: {
						title: "Nueva Columna",
						name: "Nombre de la columna",
						color: "Color de la columna",
						create: "Crear Columna",
						success: "Columna creada con éxito",
						error: "Error al crear columna"
					},
					errors: {
						loadQueues: "Error al cargar sectores",
						loadLanes: "Error al cargar columnas",
						loadTickets: "Error al cargar tickets",
						moveCard: "Error al mover ticket",
						deleteTag: "Error al eliminar columna",
						updateTag: "Error al actualizar columna"
					},
					success: {
						cardMoved: "Ticket movido con éxito",
						tagDeleted: "Columna eliminada con éxito",
						tagUpdated: "Columna actualizada con éxito"
					}
				},
				filters: {
					searchPlaceholder: "Buscar tickets...",
					dateFrom: "Fecha inicial",
					dateTo: "Fecha final",
					users: "Filtrar por agente",
					status: "Estado del ticket",
					queues: "Departamentos",
					noResults: "No se encontraron resultados"
				},
				card: {
					ticketNumber: "Ticket #",
					customer: "Cliente",
					lastMessage: "Último mensaje",
					assignedTo: "Asignado a",
					status: "Estado",
					queue: "Sector",
					createdAt: "Creado en",
					updatedAt: "Actualizado en",
					noMessage: "Sin mensajes"
				},
				lane: {
					actions: {
						edit: "Editar columna",
						delete: "Eliminar columna",
						confirm: "Confirmar",
						cancel: "Cancelar"
					},
					edit: {
						title: "Editar columna",
						name: "Nombre",
						color: "Color",
						save: "Guardar cambios"
					},
					delete: {
						title: "Excluir Coluna",
						message: "¿Estás seguro de que deseas eliminar esta columna?",
						warning: "Todos los tickets se moverán a la columna predeterminada"
					},
					tickets: "tickets"
				},
				actions: {
					settings: "Configuraciones del tablero",
					newLane: "Nueva columna",
					refresh: "Actualizar tablero",
					expand: "Expandir",
					collapse: "Contraer"
				},
				settings: {
					title: "Configurações do Quadro",
					general: {
						title: "Configuraciones Generales",
						autoRefresh: "Actualización automática",
						refreshInterval: "Intervalo de actualización",
						cardSize: "Tamaño de las tarjetas",
						compactView: "Vista compacta"
					},
					display: {
						title: "Visualización",
						showAvatars: "Mostrar avatares",
						showTags: "Mostrar etiquetas",
						showPriority: "Mostrar prioridad",
						showDueDate: "Mostrar plazo"
					}
				},
				tooltips: {
					addLane: "Añadir nueva columna",
					editLane: "Editar columna",
					deleteLane: "Eliminar columna",
					moveTicket: "Mover ticket",
					openTicket: "Abrir ticket"
				},
				emptyState: {
					title: "Seleccione un sector para ver el Kanban",
					message: "Para ver los tickets en el tablero Kanban, primero seleccione un sector en el menú de arriba.",
					buttonText: "Seleccionar Sector"
				},
				confirmations: {
					deleteLane: {
						title: "Excluir Coluna",
						message: "Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita."
					}
				},
				notifications: {
					ticketMoved: "Ticket movido a {lane}",
					laneCreated: "Columna creada con éxito",
					laneUpdated: "Columna actualizada con éxito",
					laneDeleted: "Columna eliminada con éxito"
				},
				infoModal: {
					title: "Información del Tablero Kanban",
					tooltipInfo: "Información sobre el Kanban",
					closeButton: "Cerrar",
					scheduleTimeTitle: "Horario de programación:",
					scheduleTimeDescription: "Todas las programaciones se enviarán entre las 18:00 y las 18:30.",
					recurringScheduleTitle: "Programación recurrente:",
					recurringStep1: "Ve a la pestaña de \"Etiquetas de Campaña\".",
					recurringStep2: "Cree nuevas etiquetas, si es necesario.",
					recurringStep3: "Siga estos pasos:",
					subStep1: "Vaya a la configuración del engranaje.",
					subStep2: "Seleccione uno de los tableros disponibles.",
					subStep3: "Cambie el mensaje que se enviará.",
					subStep4: "Si es necesario, elija un archivo para enviar.",
					subStep5: "Elija la frecuencia de la programación (cada cuántos días).",
					subStep6: "Haga clic en \"Guardar\".",
					noActiveCampaignsTitle: "Tickets sin Campañas Activas:",
					noActiveCampaignsDescription: "Todos los tickets sin campañas activas se moverán al tablero \"En Abierto\".",
					createCampaignTitle: "Crear una Campaña:",
					createCampaignDescription: "Para crear una campaña, arrastre el ticket al tablero de campaña de su elección.",
					moveTicketsTitle: "Mover Tickets entre Tableros:",
					moveTicketsStep1: "Al mover un ticket a un tablero, las programaciones se harán según la configuración del tablero.",
					moveTicketsStep2: "Al mover un ticket a otro tablero, las programaciones existentes se eliminarán y se creará una nueva programación según el tablero elegido.",
					moveTicketsStep3: "Al mover un ticket de vuelta al tablero \"En Abierto\", las programaciones existentes del ticket se eliminarán."
				}
			},
			transferTicketsModal: {
				title: "Transferir Tickets",
				warning: "¡Atención! Esta acción no se puede deshacer",
				description: "Seleccione una conexión para transferir los tickets antes de eliminar esta conexión. Todos los tickets abiertos se moverán a la conexión seleccionada.",
				selectLabel: "Seleccione la conexión de destino",
				sourceConnection: {
					label: "Conexión de origen",
					status: {
						active: "Activa",
						inactive: "Inactiva"
					}
				},
				buttons: {
					cancel: "Cancelar",
					confirm: "Transferir y Eliminar"
				},
				success: "¡Tickets transferidos con éxito!",
				error: "Error al transferir los tickets. Inténtelo de nuevo."
			},
			queueIntegration: {
				title: "Integraciones",
				table: {
					id: "ID",
					type: "Tipo",
					name: "Nombre",
					projectName: "Nombre del Proyecto",
					language: "Lenguaje",
					lastUpdate: "Última actualización",
					actions: "Acciones"
				},
				buttons: {
					add: "Añadir Proyecto"
				},
				toasts: {
					deleted: "Integración eliminada con éxito."
				},
				searchPlaceholder: "Buscar...",
				confirmationModal: {
					deleteTitle: "Eliminar",
					deleteMessage: "¿Estás seguro? ¡Esta acción no se puede deshacer! y se eliminará de los sectores y conexiones vinculadas"
				},
				form: {
					n8nApiKey: "Clave API de n8n"
				}
			},
			files: {
				modal: {
					addTitle: "Nueva Lista de Archivos",
					editTitle: "Editar Lista de Archivos",
					name: "Nombre de la Lista",
					description: "Descripción",
					add: "Agregar",
					saveChanges: "Guardar Cambios",
					cancel: "Cancelar",
					noPreview: "No hay vista previa disponible"
				},
				buttons: {
					add: "Agregar",
					edit: "Editar",
					delete: "Eliminar",
					upload: "Seleccionar Archivo",
					download: "Descargar",
					close: "Cerrar",
					openPdf: "Abrir PDF",
					selectFile: "Seleccionar Archivo",
					addList: "Nueva Lista"
				},
				deleteDialog: {
					title: "Eliminar Lista de Archivos",
					message: "Esta acción eliminará todos los archivos asociados a esta lista. Esta acción no se puede deshacer."
				},
				deleteFileDialog: {
					title: "Eliminar Archivo",
					message: "¿Seguro que deseas eliminar este archivo? Esta acción no se puede deshacer."
				},
				empty: {
					title: "No se encontró ninguna lista de archivos",
					message: "Crea tu primera lista de archivos para compartir en tus campañas."
				},
				tooltips: {
					edit: "Editar lista",
					delete: "Eliminar lista",
					view: "Ver archivo",
					download: "Descargar archivo"
				},
				searchPlaceholder: "Buscar listas de archivos...",
				filesList: "Archivos en la Lista",
				emptyFileList: "No hay archivos en esta lista. Sube tu primer archivo.",
				preview: {
					title: "Visualización del Archivo",
					description: "Descripción",
					details: "Detalles del archivo",
					noPreview: "Visualización no disponible para este archivo",
					pdfMessage: "Haz clic en el botón de abajo para abrir el PDF",
					notSupported: "Visualización no disponible para este tipo de archivo"
				},
				table: {
					name: "Nombre",
					type: "Tipo",
					size: "Tamaño",
					actions: "Acciones",
					unknownType: "Tipo desconocido"
				},
				validation: {
					nameRequired: "El nombre es obligatorio",
					nameMin: "El nombre debe tener al menos 2 caracteres",
					nameMax: "El nombre debe tener como máximo 100 caracteres",
					descriptionMax: "La descripción debe tener como máximo 500 caracteres"
				},
				toasts: {
					added: "¡Lista de archivos creada con éxito!",
					updated: "¡Lista de archivos actualizada con éxito!",
					deleted: "¡Lista de archivos eliminada con éxito!",
					fileDeleted: "¡Archivo eliminado con éxito!",
					fileAddedToList: "¡Archivo añadido con éxito!",
					filesAddedToList: "{count} archivos añadidos con éxito!",
					fetchError: "Error al buscar listas de archivos.",
					error: "Se produjo un error. Inténtalo de nuevo.",
					deleteError: "Error al eliminar lista de archivos.",
					deleteFileError: "Error al eliminar archivo.",
					uploadError: "Error al subir el archivo.",
					uploadMultipleError: "Error al subir los archivos."
				},
				noResults: "No se encontraron resultados para la búsqueda."
			},
			messagesAPI: {
				title: "API",
				contactNumber: "Nº de contacto",
				contactName: "Nombre del contacto",
				contactEmail: "Correo electrónico del contacto",
				statusCompany: "Estado de la empresa",
				searchParam: "Nombre o número de contacto",
				pageNumber: "Nº de página para paginación",
				doc: "Documentación para envío de mensajes:",
				formMethod: "Método de envío:",
				token: "Token registrado",
				apiToken: "Token Registrado",
				ticketId: "ID del Ticket",
				queueId: "ID del Sector",
				status: "Estado del ticket",
				id: "ID de la Factura",
				updateFields: "Datos a actualizar",
				updateData: "Datos a actualizar",
				queue: "Sector",
				tags: "Etiquetas",
				tagId: "ID de la Etiqueta",
				invoiceId: "ID de la Factura",
				companyId: "ID de la Empresa",
				body: "Mensaje",
				contactData: "Datos del contacto",
				contactId: "ID del Contacto",
				file: "Arquivo",
				number: "Número",
				pdfLink: "Enlace del PDF",
				medias: "Medios",
				imageLink: "Enlace de imagen",
				audioLink: "Enlace de audio",
				textMessage: {
					number: "Número",
					body: "Mensaje",
					token: "Token registrado"
				},
				mediaMessage: {
					number: "Número",
					body: "Nombre del archivo",
					media: "Arquivo",
					token: "Token registrado"
				},
				buttons: {
					submit: "Enviar"
				},
				helpTexts: {
					textMsg: {
						title: "Mensaje de Texto",
						info: "A continuación se muestra la lista de información necesaria para ",
						endpoint: "Endpoint: ",
						method: "Método: ",
						headers: "Headers: ",
						body: "Cuerpo: "
					},
					test: "Prueba de envío: ",
					mediaMsg: {
						title: "Mensaje de Medios",
						info: "A continuación se muestra la lista de información necesaria para ",
						endpoint: "Endpoint: ",
						method: "Método: ",
						headers: "Headers: ",
						body: "Cuerpo: ",
						formData: "FormData: "
					},
					instructions: "Instrucciones",
					notes: {
						title: "Observaciones importantes",
						textA: "Antes de enviar mensajes, es necesario registrar el token vinculado a la conexión que enviará los mensajes. <br/>Para registrar, acceda al menú 'Conexiones', haga clic en el botón de edición de la conexión e inserte el token en el campo correspondiente.",
						textB: {
							title: "El número para enviar no debe tener máscara o caracteres especiales y debe estar compuesto por:",
							partA: "Código del País",
							partB: "DDD",
							partC: "Número"
						}
					},
					info: "A continuación se muestra la lista de información necesaria para ",
					endpoint: "Endpoint: ",
					method: "Método: ",
					headers: "Headers: ",
					body: "Cuerpo: "
				},
				apiRoutes: {
					token: "Token para validación de la conexión"
				}
			},
			notifications: {
				title: "Mensajes",
				message: "mensaje",
				messages: "mensajes",
				noTickets: "No hay mensajes sin leer.",
				clearAll: "Limpiar todo",
				cleared: "¡Notificaciones limpiadas con éxito!",
				clearError: "¡Error al limpiar notificaciones!",
				newMessage: "Nuevo mensaje",
				permissionGranted: "¡Permiso para notificaciones concedido!",
				permissionDenied: "Permiso para notificaciones denegado. Actívelo en la configuración del navegador.",
				permissionError: "Error al solicitar permiso para notificaciones.",
				enableNotifications: "Activar notificaciones"
			},
			quickMessages: {
				title: "Respuestas Rápidas",
				searchPlaceholder: "Buscar...",
				noAttachment: "Sin adjunto",
				permission: "Solo los administradores y supervisores pueden editar",
				confirmationModal: {
					deleteTitle: "Eliminar respuesta rápida",
					deleteMessage: "¡Esta acción es irreversible! ¿Desea continuar?"
				},
				buttons: {
					add: "Agregar Respuesta Rápida",
					attach: "Adjuntar Archivo",
					cancel: "Cancelar",
					edit: "Editar",
					delete: "Eliminar",
					startRecording: "Iniciar Grabación",
					stopRecording: "Detener Grabación",
					playAudio: "Reproducir Audio",
					save: "Guardar"
				},
				toasts: {
					success: "¡Respuesta rápida agregada con éxito!",
					deleted: "¡Respuesta rápida eliminada con éxito!",
					error: "Error al procesar respuesta rápida"
				},
				dialog: {
					title: "Respuesta Rápida",
					shortcode: "Atajo",
					message: "Respuesta",
					save: "Guardar",
					cancel: "Cancelar",
					geral: "Permitir edición",
					add: "Agregar",
					edit: "Editar",
					visao: "Permitir visualización",
					no: "No",
					yes: "Sí",
					geralHelper: "Permitir que todos los usuarios editen esta respuesta rápida",
					recordedAudio: "Audio grabado",
					validation: {
						required: "Este campo es obligatorio",
						minLength: "Mínimo de 3 caracteres",
						maxLength: "Máximo de 255 caracteres"
					}
				},
				table: {
					shortcode: "Atajo",
					message: "Mensaje",
					actions: "Acciones",
					mediaName: "Nombre del Archivo",
					status: "Estado",
					media: "Medios",
					permissions: "Permisos",
					createdAt: "Creado en",
					updatedAt: "Actualizado en"
				}
			},
			mediaInput: {
				previewTitle: "Vista previa de Medios",
				caption: "Añadir una leyenda...",
				captions: "Leyendas",
				addTag: "Agregar etiqueta (hashtag)",
				duplicate: "Duplicar",
				attach: "Adjuntar archivo(s)",
				contact: "Contactos",
				metadata: {
					title: "Título",
					name: "Nombre",
					type: "Tipo",
					size: "Tamaño",
					modified: "Modificado en:"
				},
				buttons: {
					crop: "Recortar imagen",
					draw: "Dibujar en la imagen",
					zoomIn: "Aumentar zoom",
					showMetadata: "Mostrar metadatos del archivo",
					zoomOut: "Disminuir zoom",
					addTag: "Agregar hashtag",
					duplicate: "Duplicar",
					delete: "Eliminar",
					cancel: "Cancelar",
					send: "Enviar",
					fullscreen: "Entrar en pantalla completa",
					download: "Descargar",
					copy: "Copiar"
				}
			},
			messageVariablesPicker: {
				label: "Variables disponibles",
				vars: {
					contactFirstName: "Primer Nombre",
					contactName: "Nombre",
					ticketId: "ID del Ticket",
					user: "Usuario",
					greeting: "Saludo",
					ms: "Milisegundos",
					hour: "Hora",
					date: "Fecha",
					queue: "Sector",
					connection: "Conexión",
					dataHora: "Fecha y Hora",
					protocolNumber: "N. de Protocolo",
					nameCompany: "Nombre de la Empresa"
				}
			},
			contactLists: {
				dialog: {
					add: "Nueva Lista de Contactos",
					edit: "Editar Lista de Contactos",
					name: "Nombre de la Lista",
					cancel: "Cancelar",
					okAdd: "Agregar",
					okEdit: "Guardar"
				},
				confirmationModal: {
					deleteTitle: "Eliminar lista de contactos",
					deleteMessage: "Esta acción no se puede deshacer. Todos los contactos de esta lista serán eliminados."
				},
				empty: {
					title: "No se encontró ninguna lista de contactos",
					message: "Crea tu primera lista de contactos para comenzar campañas.",
					button: "Crear Lista"
				},
				searchPlaceholder: "Buscar listas de contactos...",
				toasts: {
					fetchError: "Error al buscar listas de contactos.",
					deleted: "¡Lista de contactos eliminada con éxito!",
					added: "¡Lista de contactos creada con éxito!",
					edited: "¡Lista de contactos actualizada con éxito!",
					saveError: "Error al guardar lista de contactos."
				},
				buttons: {
					add: "Nueva Lista",
					edit: "Editar",
					delete: "Eliminar"
				},
				table: {
					name: "Nombre",
					contacts: "Contactos",
					actions: "Acciones"
				}
			},
			announcements: {
				active: "Activo",
				inactive: "Inactivo",
				title: "Informativos",
				searchPlaceholder: "Búsqueda",
				buttons: {
					add: "Nueva Información",
					contactLists: "Listas de Información"
				},
				empty: {
					title: "No hay información disponible",
					message: "¡No se encontraron comunicados. Haz clic en 'Nueva Información' para crear el primero!",
					button: "Nueva Información"
				},
				form: {
					title: "Título de la Información",
					uploadMedia: "Adjuntar archivo(s)",
					priority: "Prioridad de la Información"
				},
				table: {
					priority: "Prioridad",
					title: "Título",
					text: "Texto",
					mediaName: "Arquivo",
					status: "Estado",
					actions: "Acciones",
					createdAt: "Fecha de Creación"
				},
				modal: {
					addTitle: "Creando nueva información",
					editTitle: "Editando información"
				},
				priority: {
					low: "Baja",
					medium: "Media",
					high: "Alta"
				},
				dialog: {
					edit: "Edición de Información",
					add: "Nueva Información",
					update: "Editar Informativo",
					readonly: "Solo Visualización",
					form: {
						priority: "Prioridad",
						title: "Título",
						text: "Texto",
						mediaPath: "Arquivo",
						status: "Estado"
					},
					buttons: {
						add: "Agregar",
						edit: "Actualizar",
						okadd: "Ok",
						cancel: "Cancelar",
						close: "Cerrar",
						attach: "Adjuntar Archivo"
					}
				},
				confirmationModal: {
					deleteTitle: "Eliminar",
					deleteMessage: "Esta acción no se puede revertir."
				},
				toasts: {
					success: "Operación realizada con éxito",
					deleted: "Registro eliminado"
				},
				tooltips: {
					addNew: "Añadir una nueva información",
					listView: "Cambiar a vista de lista",
					cardView: "Cambiar a vista de tarjeta"
				}
			},
			queues: {
				title: "Departamentos y Chatbot",
				noDataFound: "No se encontraron sectores.",
				noDataFoundMessage: "¡Parece que aún no hay sectores registrados. ¡Agrega uno nuevo y optimiza tu comunicación!",
				table: {
					id: "ID",
					name: "Nombre",
					color: "Color",
					greeting: "Mensaje de saludo",
					actions: "Acciones",
					orderQueue: "Ordenación del Sector (bot)"
				},
				buttons: {
					add: "Agregar Sector"
				},
				confirmationModal: {
					deleteTitle: "Eliminar",
					deleteMessage: "¿Estás seguro? ¡Esta acción no se puede revertir! Las atenciones de este sector seguirán existiendo, pero ya no tendrán ningún sector asignado."
				},
				toasts: {
					success: "Operación realizada con éxito",
					deleted: "Sector eliminado con éxito"
				}
			},
			queueSelect: {
				inputLabel: "Departamentos"
			},
			users: {
				title: "Usuarios",
				userUser: "Convertir en SuperAdmin",
				table: {
					name: "Nombre",
					email: "Email",
					profile: "Perfil",
					status: "Estado",
					actions: "Acciones"
				},
				buttons: {
					add: "Agregar Usuario",
					edit: "Editar Usuario",
					delete: "Eliminar Usuario",
					duplicate: "Duplicar Usuario",
					listView: "Vista en Lista",
					cardView: "Vista en Tarjetas"
				},
				labels: {
					selectCompany: "Seleccionar Empresa",
					allCompanies: "Todas las Empresas"
				},
				roles: {
					admin: "Administrador",
					user: "Usuario",
					superv: "Supervisor"
				},
				profile: {
					admin: "Administrador",
					user: "Usuario",
					superv: "Supervisor"
				},
				confirmationModal: {
					deleteTitle: "Confirmar eliminación",
					deleteMessage: "¿Estás seguro de que deseas eliminar a este usuario?"
				},
				toasts: {
					deleted: "Usuario eliminado exitosamente",
					deleteError: "Error al eliminar usuario",
					duplicated: "Usuario duplicado exitosamente",
					duplicateError: "Error al duplicar usuario",
					loadUsersError: "Error al cargar usuarios",
					loadCompaniesError: "Error al cargar empresas"
				},
				status: {
					online: "En línea:",
					offline: "Desconectado:"
				},
				superUserIndicator: "Usuario Super Admin"
			},
			stripe: {
				title: "Configuraciones de Stripe",
				publicKey: "Clave Pública",
				secretKey: "Clave Secreta",
				webhookSecret: "Clave del Webhook",
				webhookUrl: "URL del Webhook",
				publicKeyTooltip: "Clave pública de Stripe (pk_...)",
				secretKeyTooltip: "Clave secreta de Stripe (sk_...)",
				webhookSecretTooltip: "Clave secreta del webhook (whsec_...)",
				webhookUrlTooltip: "Utilice esta URL al configurar el webhook en el panel de Stripe"
			},
			compaies: {
				title: {
					main: "Empresas",
					add: "Registrar empresa",
					edit: "Editar empresa"
				},
				table: {
					id: "ID",
					status: "Activo",
					name: "Nombre",
					email: "Email",
					passwordDefault: "Contraseña",
					numberAttendants: "Atendentes",
					numberConections: "Conexiones",
					value: "Valor",
					namePlan: "Nombre del Plan",
					numberQueues: "Departamentos",
					useCampaigns: "Campañas",
					useExternalApi: "API Rest",
					useFacebook: "Facebook",
					useInstagram: "Instagram",
					useWhatsapp: "Whatsapp",
					useInternalChat: "Chat Interno",
					useSchedules: "Programación",
					createdAt: "Creado en",
					dueDate: "Vencimiento",
					lastLogin: "Últ. Inicio de Sesión",
					folderSize: "Tamaño de la Carpeta",
					numberOfFiles: "Número de Archivos",
					lastUpdate: "Última Actualización",
					actions: "Acciones"
				},
				buttons: {
					add: "Agregar empresa",
					cancel: "Cancelar cambios",
					okAdd: "Guardar",
					okEdit: "Cambiar"
				},
				toasts: {
					deleted: "Empresa eliminada exitosamente."
				},
				confirmationModal: {
					deleteTitle: "Eliminar",
					deleteMessage: "Todos los datos de la empresa se perderán. Los tickets abiertos de este usuario se moverán al sector."
				}
			},
			helps: {
				title: "Centro de Ayuda",
				videoTab: "Videos de Ayuda",
				apiTab: "Documentación de la API",
				noDataFound: "No hay videos disponibles",
				noDataFoundMessage: "Actualmente no hay videos de ayuda registrados en el sistema."
			},
			schedules: {
				title: "Agendamientos",
				searchPlaceholder: "Buscar citas...",
				loading: "Cargando citas...",
				emptyState: {
					title: "No se encontraron citas",
					description: "Cree una nueva cita o ajuste los filtros de búsqueda"
				},
				buttons: {
					add: "Nuevo Agendamiento",
					addShort: "Nuevo",
					edit: "Editar",
					delete: "Eliminar",
					save: "Guardar",
					create: "Crear",
					cancel: "Cancelar",
					close: "Cerrar",
					filter: "Filtrar",
					calendarView: "Vista de Calendario",
					listView: "Vista en Lista",
					refresh: "Actualizar",
					view: "Ver detalles",
					download: "Descargar adjunto"
				},
				filters: {
					all: "Todas las citas",
					pending: "Pendientes",
					sent: "Enviados",
					error: "Con error",
					allConnections: "Todas las conexiones",
					whatsappConnection: "Filtrar por conexión"
				},
				tabs: {
					today: "Hoy",
					pending: "Pendientes",
					sent: "Enviados"
				},
				stats: {
					total: "Total de citas",
					pending: "Pendientes",
					sent: "Enviados",
					error: "Con error"
				},
				status: {
					sent: "Enviado",
					pending: "Pendiente",
					error: "Error",
					processing: "Procesando",
					cancelled: "Cancelado",
					unknown: "Desconocido"
				},
				form: {
					titleAdd: "Nuevo Agendamiento",
					titleEdit: "Editar Agendamiento",
					contactSection: "Contacto",
					messageSection: "Mensaje",
					messagePlaceholder: "Ingrese el mensaje a enviar...",
					scheduleSection: "Programación",
					recurrenceSection: "Recurrencia",
					whatsappSection: "Conexión a utilizar",
					selectWhatsapp: "Seleccione la conexión",
					sendAt: "Fecha y hora de envío",
					sendAtHelp: "El mensaje se enviará automáticamente en esta fecha y hora",
					enableRecurrence: "Habilitar recurrencia",
					recurrencePattern: "Patrón de recurrencia",
					recurrenceEndDate: "Fecha de finalización de la recurrencia",
					recurrenceHelp: "Los mensajes se enviarán repetidamente hasta la fecha de finalización",
					attachment: "Adjunto",
					attachmentHelp: "Tamaño máximo: 5MB",
					insertEmoji: "Insertar emoji",
					uploadImage: "Enviar imagen"
				},
				recurrence: {
					none: "Sin recurrencia",
					daily: "Diariamente",
					weekly: "Semanalmente",
					biweekly: "Cada dos semanas",
					monthly: "Mensualmente",
					quarterly: "Trimestralmente",
					semiannually: "Semestralmente",
					yearly: "Anualmente"
				},
				scheduleDetails: {
					title: "Detalles de la programación",
					contactInfo: "Información de contacto",
					details: "Detalles",
					message: "Mensaje",
					attachment: "Adjunto",
					createdAt: "Creado en",
					sendAt: "Programado para",
					sentAt: "Enviado en",
					recurrence: {
						title: "Recurrencia",
						none: "Sin recurrencia",
						daily: "Diariamente",
						weekly: "Semanalmente",
						biweekly: "Cada dos semanas",
						monthly: "Mensualmente",
						quarterly: "Trimestralmente",
						semiannually: "Semestralmente",
						yearly: "Anualmente"
					},
					recurrenceEnd: "Final de la recurrencia",
					createdBy: "Creado por",
					errorTitle: "Error en el envío",
					whatsappConnection: "Conexión a utilizar",
					errorMessage: "Se produjo un error al intentar enviar este mensaje",
					downloadError: "Error al descargar el adjunto",
					buttons: {
						close: "Cerrar",
						edit: "Editar",
						delete: "Eliminar",
						download: "Descargar"
					},
					contact: "Contacto",
					status: {
						sent: "Enviado",
						pending: "Pendiente",
						error: "Error",
						processing: "Procesando",
						cancelled: "Cancelado",
						unknown: "Desconocido"
					}
				},
				selectContact: "Seleccione un contacto",
				loadingContacts: "Cargando contactos...",
				noContactsFound: "No se encontraron contactos",
				contactSelectError: "Error al cargar contactos",
				validation: {
					bodyRequired: "El mensaje es obligatorio",
					bodyMinLength: "El mensaje debe tener al menos 5 caracteres",
					contactRequired: "Debe seleccionar un contacto",
					sendAtRequired: "La fecha de envío es obligatoria",
					futureDateRequired: "La fecha de envío debe ser futura",
					patternRequired: "El patrón de recurrencia es obligatorio",
					endDateRequired: "La fecha final de la recurrencia es obligatoria",
					endDateAfterSendAt: "La fecha final debe ser posterior a la fecha de envío"
				},
				toasts: {
					created: "Programación creada con éxito",
					updated: "Programación actualizada con éxito",
					deleted: "Programación eliminada con éxito",
					attachmentDeleted: "Adjunto eliminado con éxito",
					loadError: "Error al cargar programaciones",
					saveError: "Error al guardar la programación",
					deleteError: "Error al eliminar la programación",
					attachmentError: "Error al enviar el adjunto",
					attachmentDeleteError: "Error al eliminar el adjunto",
					contactLoadError: "Error al cargar contactos",
					fileSizeError: "El archivo debe tener como máximo 5MB"
				},
				calendar: {
					date: "Fecha",
					time: "Hora",
					event: "Evento",
					allDay: "Día completo",
					week: "Semana",
					work_week: "Semana laboral",
					day: "Día",
					month: "Mes",
					previous: "Anterior",
					next: "Siguiente",
					yesterday: "Ayer",
					tomorrow: "Mañana",
					today: "Hoy",
					agenda: "Agenda",
					noEventsInRange: "No hay citas en este período"
				},
				confirmationModal: {
					deleteTitle: "Eliminar Cita",
					deleteMessage: "¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer."
				},
				attachment: "Adjunto",
				unknownContact: "Contacto desconocido"
			},
			validation: {
				required: "Este campo es obligatorio",
				invalidTime: "Formato de hora inválido",
				endBeforeStart: "La hora final no puede ser anterior a la hora inicial",
				lunchOutsideWork: "El horario de almuerzo debe estar dentro del horario laboral",
				lunchEndBeforeStart: "El fin del almuerzo no puede ser anterior al inicio del almuerzo",
				completeLunchTime: "Complete ambos los horarios de almuerzo o déjelos en blanco"
			},
			contactPicker: {
				label: "Seleccionar Contacto",
				typeMore: "Ingrese al menos 2 caracteres para buscar",
				noOptions: "No se encontraron contactos",
				loading: "Cargando...",
				noResultsFound: "No se encontraron resultados para esta búsqueda",
				errorFetching: "Error al buscar contactos",
				errorFetchingInitial: "Error al cargar el contacto inicial"
			},
			subscriptionBanner: {
				message: "Tu período de prueba termina en {{days}} días y {{hours}} horas. ¡Suscríbete ahora para evitar interrupciones en el servicio!",
				subscribe: "Suscribirse ahora"
			},
			common: {
				create: "Guardar",
				close: "Cerrar",
				edit: "Editar",
				save: "Guardar",
				delete: "Eliminar",
				cancel: "Cancelar",
				apply: "Filtrar",
				clear: "Limpiar",
				rowsPerPage: "Resultados por página(s):",
				displayedRows: "Página(s):"
			},
			serviceHours: {
				collapse: "Contraer",
				expand: "Expandir",
				workingHours: "Horario de Funcionamiento",
				workTime: "Horario de Trabajo",
				startTime: "Hora de Inicio",
				endTime: "Hora de Término",
				lunchTime: "Hora de Almuerzo",
				startLunchTime: "Inicio del Almuerzo",
				endLunchTime: "Término del Almuerzo",
				formAriaLabel: "Formulario de Horarios Comerciales",
				successMessage: "¡Horarios actualizados con éxito!",
				defaultError: "Error al guardar los horarios. Verifica los datos ingresados.",
				optional: "Opcional",
				optionalField: "Campo opcional",
				validation: {
					required: "Campo obligatorio",
					invalidTime: "Formato de hora inválido (use HH:MM)",
					endBeforeStart: "La hora final no puede ser anterior a la inicial",
					lunchOutsideWork: "El horario de almuerzo debe estar dentro del horario laboral",
					lunchEndBeforeStart: "El término del almuerzo no puede ser anterior al inicio",
					completeLunchTime: "Complete ambos los horarios de almuerzo o déjelos en blanco"
				},
				daysweek: {
					day1: "Lunes",
					day2: "Martes",
					day3: "Miércoles",
					day4: "Jueves",
					day5: "Viernes",
					day6: "Sábado",
					day7: "Domingo"
				}
			},
			tags: {
				title: "Etiquetas",
				searchPlaceholder: "Buscar etiquetas...",
				noDataFound: "¡Ups, nada por aquí!",
				noDataFoundMessage: "No se encontró ninguna etiqueta. ¡No te preocupes, puedes crear la primera! Haz clic en el botón de abajo para empezar.",
				buttons: {
					add: "Nueva Etiqueta",
					edit: "Editar Etiqueta",
					delete: "Eliminar Etiqueta",
					deleteSelected: "Eliminar Seleccionados",
					addToKanban: "Agregar al Kanban",
					removeFromKanban: "Eliminar del Kanban",
					selectAll: "Seleccionar Todos",
					unselectAll: "Desmarcar Todos",
					bulkActions: "Acciones en masa",
					export: "Exportar",
					cancel: "Cancelar",
					create: "Crear",
					update: "Actualizar"
				},
				toasts: {
					updated: "Etiqueta actualizada"
				},
				table: {
					id: "ID",
					name: "Nombre",
					color: "Color",
					tickets: "Tickets",
					kanban: "Kanban",
					actions: "Acciones",
					msgRecurrent: "Mensaje Recurrente",
					recurrentTime: "Tiempo Recurrente",
					actCamp: "Campaña Activa",
					rptDays: "Días para Repetir"
				},
				tooltips: {
					edit: "Editar etiqueta",
					delete: "Eliminar etiqueta",
					addToKanban: "Agregar al tablero Kanban",
					removeFromKanban: "Eliminar del tablero Kanban",
					bulkActions: "Acciones en masa",
					search: "Buscar etiquetas"
				},
				modal: {
					title: {
						add: "Nueva Etiqueta",
						edit: "Editar Etiqueta"
					},
					buttons: {
						create: "Guardar etiqueta",
						update: "Actualizar etiqueta",
						cancel: "Cancelar"
					},
					form: {
						name: {
							label: "Nombre",
							error: {
								required: "Nombre es obligatorio",
								min: "Nombre muy corto"
							}
						},
						color: {
							label: "Color",
							error: {
								required: "Color es obligatorio"
							}
						},
						kanban: {
							label: "Kanban"
						}
					}
				},
				confirmationModal: {
					deleteTitle: "Eliminar Etiqueta",
					deleteMessage: "¿Está seguro de que desea eliminar esta etiqueta?",
					deleteSelectedTitle: "Eliminar etiquetas seleccionadas",
					deleteSelectedMessage: "¿Está seguro de que desea eliminar las etiquetas seleccionadas?",
					kanbanTitle: "Actualizar Kanban",
					kanbanMessage: "¿Desea actualizar el estado Kanban de las etiquetas seleccionadas?",
					confirmationMessage: "Esta acción no se puede deshacer. ¿Desea continuar?",
					confirmButton: "Confirmar",
					cancelButton: "Cancelar"
				},
				messages: {
					success: {
						create: "Etiqueta creada con éxito",
						update: "Etiqueta actualizada con éxito",
						delete: "Etiqueta(s) eliminada(s) con éxito",
						kanban: "Estado Kanban actualizado con éxito"
					},
					error: {
						create: "Error al crear etiqueta",
						update: "Error al actualizar etiqueta",
						delete: "Error al eliminar etiqueta(s)",
						kanban: "Error al actualizar estado Kanban"
					}
				},
				help: {
					title: "Ayuda",
					content: "En esta pantalla puedes\n1. Crear o editar una etiqueta\n2. Definir un nombre para identificación\n3. Elegir un color personalizado\n4. Activar/desactivar el modo Kanban para usar la etiqueta en el tablero Kanban.\nConsejos:\n- El nombre debe tener al menos 3 caracteres\n- El color se usará como fondo de la etiqueta\n- El modo Kanban permite que la etiqueta aparezca en el tablero de gestión visual"
				},
				filters: {
					allTags: "Todas las etiquetas",
					onlyKanban: "Solo Kanban",
					onlyNonKanban: "Solo no Kanban"
				},
				bulk: {
					title: "Crear etiquetas en masa",
					patterns: {
						tag: "Etiqueta_1, Etiqueta_2, Etiqueta_3...",
						ticket: "Ticket_1, Ticket_2, Ticket_3...",
						priority: "Prioridad_1, Prioridad_2, Prioridad_3...",
						status: "Estado_1, Estado_2, Estado_3...",
						department: "Dept_1, Dept_2, Dept_3...",
						day: "Día_1, Día_2, Día_3..."
					},
					validation: {
						quantity: {
							min: "La cantidad mínima es 1",
							max: "La cantidad máxima es 100",
							required: "La cantidad es obligatoria"
						},
						pattern: {
							required: "El patrón de nombre es obligatorio"
						}
					},
					form: {
						quantity: "Cantidad de etiquetas",
						pattern: "Patrón de Nombre",
						kanban: "Kanban"
					},
					buttons: {
						cancel: "Cancelar",
						create: "Crear"
					},
					help: "En esta pantalla puedes:\n1. Crear múltiples etiquetas a la vez\n2. Definir la cantidad de etiquetas (1-100)\n3. Elegir un patrón para los nombres\n4. Activar/desactivar el modo Kanban para todas las etiquetas"
				}
			},
			settings: {
				loading: "Cargando configuraciones...",
				loadError: "Error al cargar configuraciones",
				title: "Configuraciones",
				tabs: {
					general: "General",
					messaging: "Mensajes",
					notifications: "Notificaciones",
					security: "Seguridad",
					chatbot: "Chatbot",
					integrations: "Integraciones",
					company: "Empresa",
					admin: "Admin",
					companies: "Empresas",
					plans: "Planes",
					helps: "Ayuda",
					params: "Parámetros",
					schedules: "Horarios"
				},
				general: {
					title: "Configuraciones Generales",
					subtitle: "Administre las configuraciones básicas del sistema",
					tickets: {
						title: "Tickets",
						oneTicketPerConnection: "Un ticket por conexión",
						oneTicketPerConnectionHelper: "Limita la creación de tickets a uno por conexión",
						showValueAndSku: "Mostrar valor y SKU",
						showValueAndSkuHelper: "Muestra información de valor y SKU en los tickets"
					},
					schedule: {
						title: "Programación",
						disabled: "Desactivado",
						company: "Por empresa",
						queue: "Por sector",
						helper: "Define cómo funcionará la programación de mensajes"
					},
					rating: {
						title: "Evaluación",
						enable: "Habilitar evaluación",
						helper: "Permite que los usuarios evalúen la atención"
					},
					contact: {
						title: "Contacto",
						showNumber: "Mostrar número de contacto",
						showNumberHelper: "Muestra el número de contacto en la información del ticket"
					}
				},
				messaging: {
					title: "Configuraciones de Mensajes",
					subtitle: "Gerencie como as mensagens são tratadas no sistema",
					quickResponses: {
						title: "Respuestas Rápidas",
						byCompany: "Por empresa",
						byUser: "Por usuario",
						helper: "Define cómo se organizan las respuestas rápidas"
					},
					greetings: {
						title: "Saludos",
						sendOnAccept: "Enviar al aceptar ticket",
						sendOnAcceptHelper: "Envía mensaje automático cuando se acepta un ticket",
						sendOnSingleQueue: "Enviar en sector único",
						sendOnSingleQueueHelper: "Envía mensaje automático cuando hay solo un sector"
					},
					groups: {
						title: "Grupos",
						ignoreGroups: "Ignorar mensajes de grupos",
						ignoreGroupsHelper: "No crea tickets para mensajes de grupos"
					},
					transfer: {
						title: "Transferencia",
						notifyOnTransfer: "Notificar transferencia",
						notifyOnTransferHelper: "Notifica a los usuarios cuando se transfiere un ticket"
					},
					ai: {
						title: "Inteligencia Artificial",
						alert: "Los recursos de IA pueden estar sujetos a cargos adicionales",
						summarize: "Resumir conversaciones",
						summarizeHelper: "Genera resúmenes automáticos de las conversaciones utilizando IA"
					}
				},
				notifications: {
					title: "Configuraciones de Notificaciones",
					subtitle: "Administre cómo se envían las notificaciones",
					register: {
						title: "Registro",
						sendEmail: "Enviar correo electrónico en el registro",
						sendEmailHelper: "Envía correo de bienvenida a nuevos usuarios",
						sendMessage: "Enviar mensaje en el registro",
						sendMessageHelper: "Envía mensaje de bienvenida a nuevos usuarios"
					},
					email: {
						title: "Email",
						smtpServer: "Servidor SMTP",
						smtpServerHelper: "Dirección del servidor SMTP",
						smtpPort: "Puerto SMTP",
						smtpPortHelper: "Puerto del servidor SMTP",
						smtpUser: "Usuario SMTP",
						smtpUserHelper: "Usuario para autenticación SMTP",
						smtpPassword: "Contraseña SMTP",
						smtpPasswordHelper: "Contraseña para autenticación SMTP",
						testSuccess: "Prueba de SMTP realizada con éxito",
						testTooltip: "Probar configuraciones de SMTP",
						smtpRequired: "Las configuraciones SMTP son necesarias para el envío de correos electrónicos",
						smtpInfo: "Obtenga más información sobre las configuraciones SMTP"
					},
					ticket: {
						title: "Tickets",
						notifyTransfer: "Notificar transferencia",
						notifyTransferHelper: "Notifica cuando un ticket es transferido",
						requireReason: "Exigir motivo al cerrar",
						requireReasonHelper: "Solicita motivo cuando un ticket es cerrado"
					}
				},
				security: {
					title: "Configuraciones de Seguridad",
					subtitle: "Administre las configuraciones de seguridad del sistema",
					access: {
						title: "Acceso",
						allowSignup: "Permitir registro",
						allowSignupHelper: "Permite que nuevos usuarios se registren"
					},
					apiToken: {
						title: "Token API",
						label: "Token de acceso a la API",
						warning: "Mantenga este token seguro",
						helper: "Token para integración con la API",
						generated: "Nuevo token generado con éxito",
						deleted: "Token eliminado con éxito",
						copied: "Token copiado al portapapeles",
						error: "Error al gestionar el token",
						info: "Utilice este token para autenticar solicitudes a la API"
					},
					limits: {
						title: "Límites",
						downloadLimit: "Límite de descarga",
						downloadLimitHelper: "Tamaño máximo para descarga de archivos"
					}
				},
				chatbot: {
					title: "Configuraciones del Chatbot",
					subtitle: "Administre las configuraciones del chatbot",
					general: {
						title: "General",
						show: "Mostrar chatbot en el menú",
						showHelper: "Muestra el chatbot en el menú principal"
					},
					types: {
						text: "Texto",
						button: "Botón",
						list: "Lista",
						helper: "Define el tipo de interfaz del chatbot"
					},
					ai: {
						title: "Inteligencia Artificial",
						info: "Configure los recursos de IA del chatbot",
						modelHelper: "Elija el modelo de IA a ser utilizado",
						summarize: "Resumir conversaciones",
						summarizeHelper: "Gera resumos das conversas automaticamente"
					},
					webhook: {
						title: "Webhook",
						url: "URL del Webhook",
						urlHelper: "Dirección para envío de eventos",
						test: "Probar Webhook",
						testSuccess: "Prueba realizada con éxito",
						testError: "Error al probar el webhook",
						required: "La URL del webhook es obligatoria",
						invalid: "URL inválida",
						enableN8N: "Habilitar N8N",
						enableN8NHelper: "Integra con la plataforma N8N"
					}
				},
				integrations: {
					title: "Integraciones",
					subtitle: "Administre las integraciones del sistema",
					warning: "Configure las integraciones con cuidado",
					enable: "Habilitar",
					save: "Guardar"
				},
				company: {
					title: "Configuraciones de la Empresa",
					subtitle: "Administre las configuraciones de su empresa",
					branding: {
						title: "Identidad Visual",
						logo: "Logotipo",
						background: "Fondo",
						upload: "Enviar archivo",
						logoHelper: "Logotipo de la empresa (máx. 1MB)",
						backgroundHelper: "Imagen de fondo (máx. 2MB)"
					},
					omie: {
						title: "Omie",
						enable: "Habilitar Omie",
						enableHelper: "Integra con la plataforma Omie",
						appKey: "Clave de la Aplicación",
						appSecret: "Clave Secreta",
						info: "Configure la integración con Omie",
						sync: "Sincronizar",
						syncSuccess: "Sincronización realizada con éxito",
						syncError: "Error en la sincronización"
					}
				},
				admin: {
					title: "Configuraciones de Administrador",
					subtitle: "Administre las configuraciones administrativas",
					warning: "Estas configuraciones afectan todo el sistema",
					unauthorized: {
						title: "Acceso No Autorizado",
						message: "No tienes permiso para acceder a estas configuraciones"
					},
					trial: {
						title: "Período de Prueba",
						days: "días",
						helper: "Define la duración del período de prueba",
						warning: "Cambiar este valor afecta a nuevos registros"
					},
					connections: {
						title: "Conexiones",
						enableAll: "Permitir todas las conexiones",
						enableAllHelper: "Permite todas las conexiones en el sistema"
					},
					support: {
						title: "Soporte",
						enable: "Habilitar soporte",
						enableHelper: "Activa el sistema de soporte",
						phone: "Teléfono de soporte",
						message: "Mensaje de soporte",
						test: "Probar soporte",
						testSuccess: "Prueba realizada con éxito",
						testError: "Error al probar el soporte"
					},
					advanced: {
						title: "Avanzado",
						warning: "Cambie estas configuraciones con precaución",
						allowSignup: "Permitir registros",
						allowSignupHelper: "Permite nuevos registros en el sistema"
					}
				},
				validation: {
					error: "Error de validación"
				},
				updateSuccess: "Configuración actualizada con éxito",
				updateError: "Error al actualizar configuración",
				genericError: "Se produjo un error al procesar la solicitud"
			},
			messagesList: {
				header: {
					assignedTo: "Asignado a:",
					dialogRatingTitle: "¿Desea dejar una evaluación de atención para el cliente?",
					dialogClosingTitle: "¡Finalizando la atención!",
					dialogRatingCancel: "Resolver con Mensaje de Finalización",
					dialogRatingSuccess: "Resolver y Enviar Evaluación",
					dialogRatingWithoutFarewellMsg: "Resolver sin Mensaje de Finalización",
					ratingTitle: "Elija un menú de evaluación",
					buttons: {
						return: "Volver",
						resolve: "Resolver",
						reopen: "Reabrir",
						accept: "Aceptar",
						rating: "Enviar Evaluación"
					}
				},
				confirm: {
					resolveWithMessage: "¿Enviar mensaje de conclusión?",
					yes: "Sí",
					no: "No"
				}
			},
			messagesInput: {
				recording: {
					tooltip: "Grabar audio"
				},
				attach: "Adjuntar archivo(s)",
				placeholderOpen: "Ingrese un mensaje",
				placeholderClosed: "Reabra o acepte este ticket para enviar un mensaje.",
				signMessage: "Firmar",
				invalidFileType: "Tipo de archivo inválido."
			},
			message: {
				edited: "Editada",
				deleted: " Mensaje eliminado por el Contacto"
			},
			contactDrawer: {
				header: "Datos del contacto",
				buttons: {
					edit: "Editar contacto"
				},
				extraInfo: "Otra información"
			},
			fileModal: {
				title: {
					add: "Agregar lista de archivos",
					edit: "Editar lista de archivos"
				},
				buttons: {
					okAdd: "Guardar",
					okEdit: "Editar",
					cancel: "Cancelar",
					fileOptions: "Agregar archivo"
				},
				form: {
					name: "Nombre de la lista de archivos",
					message: "Detalles de la lista",
					fileOptions: "Lista de archivos",
					extraName: "Mensaje para enviar con archivo",
					extraValue: "Valor de la opción"
				},
				success: "¡Lista de archivos guardada con éxito!"
			},
			ticketOptionsMenu: {
				schedule: "Programación",
				delete: "Eliminar",
				transfer: "Transferir",
				registerAppointment: "Observaciones del Contacto",
				resolveWithNoFarewell: "Finalizar Sin Mensaje de Finalización",
				acceptAudioMessage: "¿Permitir Audio?",
				appointmentsModal: {
					title: "Observaciones del Contacto",
					textarea: "Observación",
					placeholder: "Ingrese aquí la información que desea registrar"
				},
				confirmationModal: {
					title: "¿Realmente desea eliminar el ticket del contacto?",
					titleFrom: "¿Realmente desea eliminar el ticket del contacto?",
					message: "¡Atención! ¡Todos los mensajes relacionados con el ticket se perderán!"
				},
				buttons: {
					delete: "Eliminar",
					cancel: "Cancelar"
				}
			},
			confirmationModal: {
				buttons: {
					confirm: "Ok",
					cancel: "Cancelar"
				}
			},
			messageOptionsMenu: {
				delete: "Eliminar",
				reply: "Responder",
				history: "Histórico",
				edit: "Editar",
				react: "Reaccionar",
				confirmationModal: {
					title: "¿Eliminar mensaje?",
					message: "Esta acción no se puede revertir."
				},
				forward: "Seleccione para reenviar",
				forwardbutton: "REENVIAR",
				forwardmsg1: "Reenviar mensaje",
				reactions: {
					like: "Me gusta",
					love: "Amor",
					haha: "Jaja"
				},
				reactionSuccess: "¡Reacción añadida con éxito!"
			},
			forwardModal: {
				title: "Reenviar mensaje",
				fieldLabel: "Seleccione o escriba un contacto",
				buttons: {
					cancel: "Cancelar",
					forward: "Reenviar"
				}
			},
			inputErrors: {
				tooShort: "Demasiado corto",
				tooLong: "Demasiado largo",
				required: "Obligatorio",
				email: "Dirección de correo electrónico inválida"
			},
			presence: {
				unavailable: "No disponible",
				available: "Disponible",
				composing: "Escribiendo...",
				recording: "Grabando...",
				paused: "En pausa"
			},
			efi: {
				efiSettings: "Configuraciones EFI",
				certificate: "Certificado",
				clientId: "ID del Cliente",
				clientSecret: "Secreto del Cliente",
				pixKey: "Clave PIX",
				efiApiConfigInstructions: "Instrucciones para configurar la API EFI",
				fileUploadSuccess: "Archivo enviado exitosamente",
				fileUploadError: "Error al enviar el archivo",
				settingUpdateSuccess: "Configuración actualizada con éxito",
				efiInstructions: {
					0: "Acceder a la cuenta EFI",
					1: "Crear una clave PIX aleatoria, que se informará en la configuración de pagos del sistema",
					2: "En el menú izquierdo, hacer clic en \"API\" y luego en \"Crear Aplicación\"",
					3: "Dar un nombre a la aplicación (puede ser cualquier nombre, es solo para identificar la integración) y hacer clic en continuar",
					4: "En la pantalla para seleccionar alcances, haga clic en API Pix para expandir, seleccione \"Enviar PIX\" y seleccione todos los elementos, tanto Producción como Homologación",
					5: "A continuación, se generará el ID de Cliente y la Clave Secreta que deben informarse en la configuración de pagos de su sistema.",
					6: "Todavía en la pantalla de la API, seleccionar \"Mis Certificados\" en el menú izquierdo y hacer clic en \"Crear nuevo certificado\"",
					7: "Proporcionar un nombre para identificar el certificado y hacer clic en \"Crear Certificado\"",
					8: "Haga clic en descargar certificado, este certificado también se utilizará en la configuración de su sistema."
				}
			},
			assistants: {
				title: "Agentes de IA",
				searchPlaceholder: "Buscar agentes...",
				emptyState: {
					title: "Ningún agente encontrado",
					description: "Crea tu primer agente para comenzar a utilizar la IA en tu servicio de atención al cliente."
				},
				status: {
					active: "Activo",
					inactive: "Inactivo"
				},
				labels: {
					model: "Modelo",
					tools: "Herramientas",
					noTools: "Ninguna herramienta configurada",
					none: "Ninguna"
				},
				tools: {
					availableTools: "Herramientas Disponibles",
					fileSearch: "Archivos",
					codeInterpreter: "Código",
					function: "Funciones",
					fileSearchFull: "Búsqueda de Archivos",
					codeInterpreterFull: "Intérprete de Código",
					functionFull: "Funciones Personalizadas",
					fileSearchDescription: "Permite que el asistente busque y utilice información contenida en archivos.",
					codeInterpreterDescription: "Permite que el asistente ejecute código Python para análisis de datos y generación de gráficos.",
					functionDescription: "Permite que el asistente llame a funciones personalizadas para integración con sistemas externos.",
					fileSearchConfig: "Configure los archivos en la pestaña \"Archivos\".",
					codeInterpreterConfig: "Configure los archivos en la pestaña \"Archivos\".",
					functionConfig: "Configure las funciones en la pestaña \"Funciones\"."
				},
				functions: {
					enableFirst: "Active la herramienta \"Funciones Personalizadas\" en la pestaña \"Herramientas\" para configurar funciones."
				},
				tabs: {
					basicSettings: "Configuración Básica",
					tools: "Herramientas",
					files: "Archivos",
					functions: "Funciones"
				},
				table: {
					name: "Nombre",
					model: "Modelo",
					tools: "Herramientas",
					status: "Estado",
					actions: "Acciones"
				},
				form: {
					openaiApiKey: "Clave API de OpenAI",
					name: "Nombre del Agente",
					instructions: "Instrucciones",
					model: "Modelo",
					active: "Activo",
					activeHelp: "Cuando está inactivo, el agente no responderá automáticamente",
					toolType: "Tipo de Herramienta",
					toolTypeHelp: "Seleccione a qué herramienta se enviarán los archivos",
					addFiles: "Añadir Archivos",
					newFiles: "Archivos Nuevos",
					existingFiles: "Archivos Existentes",
					noFiles: "Ningún archivo encontrado"
				},
				filters: {
					allTools: "Todas",
					allModels: "Todos",
					modelLabel: "Modelo",
					toolLabel: "Herramienta"
				},
				buttons: {
					add: "Añadir",
					addEmpty: "AÑADIR AGENTE",
					import: "Importar",
					help: "Ayuda",
					edit: "Editar",
					delete: "Eliminar",
					search: "Buscar",
					cancelSelection: "Cancelar selección",
					deleteSelected: "Eliminar seleccionados",
					cancel: "Cancelar",
					okEdit: "Guardar Cambios",
					okAdd: "Añadir Agente"
				},
				modal: {
					title: {
						add: "Añadir Agente",
						edit: "Editar Agente"
					}
				},
				confirmationModal: {
					deleteTitle: "Eliminar agente",
					deleteMessage: "Esta acción no se puede deshacer. Todos los datos asociados a este agente serán eliminados permanentemente."
				},
				pagination: {
					showing: "Mostrando {visible} de {total} agentes",
					previous: "Anterior",
					next: "Siguiente"
				},
				validation: {
					required: "Obligatorio",
					tooShort: "¡Muy corto!",
					tooLong: "¡Muy largo!"
				},
				toasts: {
					success: "Agente guardado con éxito",
					deleted: "Agente eliminado con éxito",
					deleteError: "Error al eliminar agente",
					loadError: "Error al cargar agentes",
					loadAssistantError: "Error al cargar datos del agente",
					loadFilesError: "Error al cargar archivos del agente",
					saveError: "Error al guardar agente",
					fileRemoved: "Archivo eliminado con éxito",
					fileRemoveError: "Error al eliminar archivo",
					fileSizeExceeded: "El tamaño total de los archivos excede el límite de 2048KB"
				},
				help: {
					title: "Ayuda sobre Agentes de IA",
					common: {
						capabilities: "Capacidades",
						supportedFormats: "Formatos soportados",
						field: "Campo",
						description: "Descripción"
					},
					tabs: {
						introduction: "Introducción",
						creation: "Creación",
						tools: "Herramientas",
						import: "Importación",
						messageTypes: "Tipos de Mensajes"
					},
					introduction: {
						description: "Los Agentes de IA son asistentes virtuales basados en Inteligencia Artificial que pueden atender automáticamente a tus clientes.",
						whatAre: {
							title: "¿Qué son los Agentes de IA?",
							description: "Los Agentes de IA utilizan modelos avanzados de lenguaje para ofrecer atención automatizada, pero con respuestas naturales y personalizadas para tus clientes.",
							benefits: {
								personalization: "Personalización completa de respuestas y comportamiento",
								contextMemory: "Memoria de contexto para mantener conversaciones coherentes",
								tools: "Utilización de herramientas avanzadas como búsqueda en archivos y análisis de datos",
								integration: "Integración perfecta con el flujo de atención existente"
							}
						},
						page: {
							title: "La página de Agentes",
							description: "Esta página permite gestionar todos tus Agentes de IA, desde la creación hasta el monitoreo y edición.",
							sections: {
								creation: "Creación de Agentes",
								creationDesc: "Crea nuevos asistentes personalizados para necesidades específicas de tu negocio.",
								import: "Importación",
								importDesc: "Importa agentes ya configurados en tu cuenta de OpenAI para usarlos aquí.",
								search: "Búsqueda y Filtros",
								searchDesc: "Encuentra rápidamente los agentes con filtros por modelo y herramientas.",
								management: "Gestión",
								managementDesc: "Edita, elimina o desactiva agentes según sea necesario."
							}
						},
						models: {
							title: "Modelos Disponibles",
							description: "Elige entre diferentes modelos de IA, cada uno con características específicas de rendimiento, calidad y costo:",
							gpt4: "El modelo más avanzado, con mayor capacidad de comprensión y razonamiento complejo.",
							gpt4turbo: "Versión optimizada de GPT-4, ofreciendo buen equilibrio entre calidad y velocidad.",
							gpt35: "Modelo rápido y económico, ideal para tareas simples y de alto volumen.",
							capabilities: {
								contextual: "Comprensión de contexto avanzada",
								reasoning: "Razonamiento complejo",
								code: "Generación de código de alta calidad",
								analysis: "Análisis de datos sofisticado",
								speed: "Velocidad optimizada",
								knowledge: "Conocimiento más reciente",
								costBenefit: "Buena relación costo-beneficio",
								versatile: "Ideal para la mayoría de los casos de uso",
								maxSpeed: "Velocidad máxima",
								lowCost: "Costo reducido",
								simpleTasks: "Ideal para tareas simples",
								highScale: "Perfecto para alta escala"
							},
							tip: {
								title: "Consejo para elegir modelo",
								description: "Para la mayoría de los casos, GPT-4 Turbo ofrece el mejor equilibrio entre calidad y costo. Usa GPT-4 para casos que requieren razonamiento más sofisticado y GPT-3.5 para tareas simples en gran volumen."
							}
						}
					},
					creation: {
						title: "Creando un Agente",
						description: "El proceso de creación de un agente involucra algunos pasos simples, pero importantes para el buen funcionamiento del asistente.",
						stepsTitle: "Pasos para la creación",
						steps: {
							one: {
								title: "Iniciar el proceso",
								description: "Haz clic en el botón 'Añadir' en la parte superior de la página de Agentes para abrir el formulario de creación."
							},
							two: {
								title: "Configuración básica",
								description: "Completa la información esencial para el funcionamiento del agente:",
								fields: {
									apiKey: "Clave API de OpenAI",
									apiKeyDesc: "Tu clave personal de la API de OpenAI para autenticación de los servicios.",
									name: "Nombre",
									nameDesc: "Un nombre identificador para el agente, visible solo para ti.",
									instructions: "Instrucciones",
									instructionsDesc: "Directrices detalladas que definen el comportamiento, tono y conocimientos del agente.",
									model: "Modelo",
									modelDesc: "El modelo de IA a utilizar, que define capacidades y costos del agente."
								}
							},
							three: {
								title: "Activar herramientas",
								description: "Elige las herramientas que deseas poner a disposición de tu agente:",
								tools: {
									fileSearch: "Búsqueda de Archivos",
									codeInterpreter: "Intérprete de Código",
									functions: "Funciones Personalizadas"
								},
								note: "Cada herramienta añade capacidades específicas y puede requerir configuraciones adicionales."
							},
							four: {
								title: "Guardar el agente",
								description: "Haz clic en 'Añadir Agente' para finalizar la creación. El agente estará disponible inmediatamente para su uso."
							}
						},
						tips: {
							title: "Consejos para crear agentes efectivos",
							instructionsQuality: "Proporciona instrucciones detalladas y claras para obtener respuestas más precisas y en el tono deseado.",
							specificPurpose: "Crea agentes con propósitos específicos en lugar de un único agente genérico para todas las tareas.",
							testIteratively: "Prueba el comportamiento del agente regularmente y ajusta las instrucciones según sea necesario."
						}
					},
					tools: {
						title: "Herramientas Disponibles",
						description: "Los agentes pueden usar herramientas especiales que amplían sus capacidades más allá de la simple conversación por texto.",
						fileSearch: {
							title: "Búsqueda de Archivos",
							description: "Permite que el agente busque información en documentos cargados para responder preguntas basadas en su contenido.",
							capabilities: {
								retrieveInfo: "Recupera información específica de documentos",
								answerQuestions: "Responde preguntas basadas en el contenido de los archivos",
								summarize: "Crea resúmenes y síntesis de documentos extensos"
							}
						},
						codeInterpreter: {
							title: "Intérprete de Código",
							description: "Permite que el agente ejecute código Python para análisis de datos, cálculos y generación de visualizaciones.",
							capabilities: {
								executeCode: "Ejecuta código Python para análisis de datos",
								dataAnalysis: "Realiza análisis estadísticos y matemáticos",
								visualizations: "Genera gráficos y visualizaciones de datos"
							}
						},
						functions: {
							title: "Funciones Personalizadas",
							description: "Permite que el agente ejecute acciones específicas a través de funciones definidas, como integración con sistemas externos.",
							capabilities: {
								integration: "Integración con sistemas y APIs externos",
								realTime: "Acceso a datos en tiempo real",
								actions: "Ejecución de acciones específicas de negocio"
							}
						},
						configuration: {
							title: "Configuración de Herramientas",
							description: "Cada herramienta requiere configuraciones específicas para su funcionamiento adecuado:",
							fileSearch: {
								title: "Configurando la Búsqueda de Archivos",
								step1: "Activa la herramienta 'Búsqueda de Archivos' en la pestaña Herramientas.",
								step2: "Ve a la pestaña 'Archivos' y selecciona 'Búsqueda de Archivos' en el tipo de herramienta.",
								step3: "Añade los archivos que deseas poner a disposición para consulta por el agente."
							},
							codeInterpreter: {
								title: "Configurando el Intérprete de Código",
								step1: "Activa la herramienta 'Intérprete de Código' en la pestaña Herramientas.",
								step2: "Ve a la pestaña 'Archivos' y selecciona 'Intérprete de Código' en el tipo de herramienta.",
								libraries: "El entorno Python incluye bibliotecas populares como pandas, numpy, matplotlib y scikit-learn por defecto."
							},
							functions: {
								title: "Configurando Funciones Personalizadas",
								step1: "Activa la herramienta 'Funciones Personalizadas' en la pestaña Herramientas.",
								step2: "Ve a la pestaña 'Funciones' y añade las funciones que deseas poner a disposición del agente.",
								parameters: {
									title: "Configuración de Parámetros",
									name: "Nombre",
									nameDesc: "Nombre de la función que el agente llamará",
									description: "Descripción",
									descriptionDesc: "Explicación de lo que hace la función y cuándo debe usarse",
									type: "Tipo",
									typeDesc: "Tipo de dato del parámetro (string, número, boolean, etc)",
									required: "Obligatorio",
									requiredDesc: "Indica si el parámetro es obligatorio u opcional"
								}
							}
						},
						limitations: {
							title: "Limitaciones",
							description: "Las herramientas tienen algunas limitaciones importantes a considerar: el Intérprete de Código opera en un entorno aislado sin acceso a internet, la Búsqueda de Archivos soporta un número limitado de formatos, y las Funciones Personalizadas requieren configuración adicional para implementación efectiva."
						}
					},
					import: {
						title: "Importando Agentes",
						description: "Puedes importar agentes existentes de tu cuenta OpenAI para usar en el sistema.",
						processTitle: "Proceso de Importación",
						steps: {
							one: {
								title: "Iniciar importación",
								description: "Haz clic en el botón 'Importar' en la parte superior de la página de Agentes para abrir el asistente de importación.",
								note: "Necesitarás tu clave de API de OpenAI para completar este proceso."
							},
							two: {
								title: "Seleccionar agentes",
								description: "El sistema mostrará todos los agentes disponibles en tu cuenta OpenAI. Selecciona los que deseas importar."
							},
							three: {
								title: "Completar importación",
								description: "Haz clic en 'Importar Seleccionados' para finalizar el proceso. Los agentes importados aparecerán en tu lista.",
								note: "Algunos elementos como archivos y funciones específicas pueden necesitar ser reconfigurados después de la importación."
							}
						},
						advantages: {
							title: "Ventajas de la Importación",
							time: "Ahorra tiempo al reutilizar agentes ya configurados en OpenAI",
							consistency: "Mantiene la consistencia entre los agentes usados en la plataforma OpenAI y en el sistema",
							migration: "Facilita la migración gradual a nuestro sistema integrado"
						},
						limitations: {
							title: "Limitaciones de la Importación",
							description: "Existen algunas limitaciones importantes a considerar en el proceso de importación:",
							files: {
								title: "Archivos",
								description: "Los archivos asociados a los agentes en OpenAI no se importan automáticamente y necesitan ser añadidos nuevamente."
							},
							keys: {
								title: "Claves API",
								description: "Deberás proporcionar tu clave API nuevamente para cada agente, incluso si todos usan la misma clave."
							},
							functions: {
								title: "Funciones",
								description: "Las funciones personalizadas necesitarán ser reconfiguradas manualmente después de la importación."
							}
						},
						security: {
							title: "Seguridad",
							description: "Tu clave API de OpenAI se usa solo para el proceso de importación e interacción con los agentes. Se almacena de forma segura y encriptada en nuestro sistema."
						}
					},
					messageTypes: {
						title: "Tipos de Mensajes Soportados",
						description: "El agente puede enviar varios tipos de mensajes además de texto simple. Consulta a continuación los formatos soportados y cómo usarlos.",
						text: {
							title: "Mensaje de Texto",
							description: "Los mensajes de texto simples se envían automáticamente. El agente puede responder con párrafos, listas y formato básico.",
							example: "Ejemplo:",
							exampleText: "¡Hola! ¿Cómo puedo ayudarte hoy?"
						},
						location: {
							title: "Ubicación (Mapa)",
							description: "Envía coordenadas geográficas para mostrar una ubicación en el mapa.",
							example: "Formato:"
						},
						document: {
							title: "Documentos",
							description: "Envía documentos como PDF, DOC, XLS y otros formatos de archivo.",
							example: "Formato:"
						},
						video: {
							title: "Videos",
							description: "Comparte videos desde URLs externas.",
							example: "Formato:"
						},
						contact: {
							title: "Contactos",
							description: "Comparte información de contacto que se puede guardar en la agenda del usuario.",
							example: "Formato:"
						},
						audio: {
							title: "Audios",
							description: "Envía mensajes de voz o audio desde URLs externas.",
							example: "Formato:"
						},
						image: {
							title: "Imágenes",
							description: "Comparte imágenes desde URLs externas o generadas por el agente.",
							example: "Formato:"
						},
						tips: {
							title: "Consejos para el uso de mensajes",
							description: "Para usar estas funciones, incluye comandos especiales en las instrucciones de tu agente. Los comandos deben estar formateados exactamente como se muestra en los ejemplos anteriores. Se pueden combinar múltiples comandos en una sola respuesta."
						}
					}
				}
			},
			pagination: {
				itemsPerPage: "{{count}} por página",
				itemsPerPageTooltip: "Seleccione el número de elementos a mostrar por página. Esto ayuda a controlar la cantidad de información mostrada a la vez."
			},
			invoices: {
				title: "Facturas",
				search: "Buscar facturas...",
				toggleView: "Alternar vista",
				id: "ID",
				details: "Detalles",
				value: "Valor",
				dueDate: "Fecha de Vencimiento",
				status: "Estado",
				actions: "Acciones",
				pay: "Pagar",
				paid: "Pagado",
				pending: "En Abierto",
				overdue: "Vencido",
				editDueDate: "Editar Fecha de Vencimiento",
				newDueDate: "Nueva Fecha de Vencimiento",
				updating: "Actualizando...",
				confirm: "Confirmar",
				cancel: "Cancelar",
				sendWhatsapp: "Enviar por WhatsApp",
				sendEmail: "Enviar por Email",
				dueDateUpdated: "Fecha de vencimiento actualizada con éxito",
				errorUpdatingDueDate: "Error al actualizar la fecha de vencimiento",
				messageSent: "Mensaje enviado con éxito",
				messageError: "Error al enviar mensaje",
				emailSent: "Email enviado con éxito",
				emailError: "Error al enviar email",
				loadError: "Error al cargar las facturas",
				emailSubject: "Factura #${id}",
				superUserOnly: "Solo los usuarios super pueden realizar esta acción",
				whatsappMessage: {
					header: "Detalles de la Factura",
					id: "Número de Factura",
					dueDate: "Fecha de Vencimiento",
					value: "Valor",
					paymentInfo: "Información de Pago",
					footer: "Si tiene alguna pregunta, contáctenos"
				},
				emailBody: {
					header: "Detalles de su Factura",
					id: "Número de Factura",
					dueDate: "Fecha de Vencimiento",
					value: "Valor",
					paymentInstructions: "Instrucciones de Pago",
					footer: "Agradecemos su preferencia"
				},
				cardView: {
					dueIn: "Vence en",
					overdueDays: "Vencida hace",
					days: "días"
				}
			},
			newapi: {
				title: "API Playground",
				helpButton: "Ayuda",
				helpTooltip: "Ver documentación detallada de la API",
				selectRoute: "Seleccione la ruta:",
				selectLanguage: "Lenguaje:",
				replaceToken: "Reemplace (SU_TOKEN_AQUÍ) con su token de autenticación.",
				method: "Método",
				endpoint: "Endpoint",
				pathParamsInfo: "* Los parámetros de ruta indicados entre llaves {param} serán reemplazados por los valores correspondientes.",
				steps: {
					selectRoute: "Seleccionar Ruta",
					generateCode: "Generar Código",
					testApi: "Probar API"
				},
				tabs: {
					select: "Seleccionar",
					generate: "Generar Código",
					test: "Probar API"
				},
				languages: {
					javascript: "JavaScript",
					python: "Python",
					php: "PHP"
				},
				buttons: {
					send: "Enviar",
					delete: "Eliminar",
					close: "Cerrar"
				},
				success: {
					requestSuccessful: "¡Solicitud realizada con éxito!"
				},
				errors: {

					requestError: "Error en la solicitud:",
					processingError: "Error al procesar la solicitud",
					serverError: "Error",
					noResponse: "No se pudo conectar al servidor. Verifique su conexión.",
					unknownServerError: "Error desconocido del servidor"
				},
				warnings: {
					noToken: "No se detectó ningún token de autenticación. Es necesario tener un WhatsApp conectado o proporcionar un token manualmente."
				},
				formValidation: {
					required: "El campo {field} es obligatorio",
					invalidEmail: "Email inválido",
					mustBeNumber: "Debe ser un número",
					onlyNumbers: "Formato inválido. Solo se permiten números."
				},
				codeBlock: {
					copied: "¡Código copiado al portapapeles!",
					copyToClipboard: "Copiar al portapapeles"
				},
				help: {
					title: "Documentación de la API AutoAtende",
					introduction: "La API de AutoAtende te permite integrar recursos de mensajes, tickets, contactos y otras funcionalidades en tus aplicaciones. Todas las solicitudes requieren autenticación a través de token en el encabezado Authorization.",
					authTitle: "Autenticación",
					authDescription: "Todas las solicitudes a la API deben incluir un token de autenticación en el encabezado Authorization, en el formato Bearer token. Puedes obtener el token en la configuración de WhatsApp en el panel de AutoAtende.",
					authExample: "Ejemplo de cómo incluir el token en el encabezado:",
					closeButton: "Cerrar",
					parametersTitle: "Parámetros",
					responsesTitle: "Respuestas",
					exampleTitle: "Ejemplo",
					required: "obligatorio",
					noParameters: "Esta ruta no requiere parámetros adicionales.",
					noResponsesSpecified: "No hay detalles específicos sobre las respuestas de esta ruta.",
					categories: {
						messages: "Mensajes",
						tickets: "Tickets",
						contacts: "Contactos",
						companies: "Empresas",
						invoices: "Facturas",
						dashboard: "Dashboard"
					},
					messagesDescription: "Endpoints para envío de mensajes, archivos y verificación de números en WhatsApp.",
					ticketsDescription: "Endpoints para gestión de tickets (creación, actualización, cierre y listado).",
					contactsDescription: "Endpoints para gestión de contactos (creación, actualización, eliminación y listado).",
					companiesDescription: "Endpoints para gestión de empresas (creación, actualización y bloqueo).",
					invoicesDescription: "Endpoints para consulta de facturas.",
					dashboardDescription: "Endpoints para obtención de datos estadísticos y métricas del sistema.",
					endpoints: {
						sendMessage: {
							description: "Envía un mensaje de texto a un número de WhatsApp. Puede incluir archivos multimedia.",
							params: {
								number: "Número del destinatario (incluyendo el código de país y DDD, sin caracteres especiales)",
								body: "Contenido del mensaje",
								medias: "Archivos multimedia para enviar (opcional)",
								queueId: "ID de la cola para asociar el ticket",
								status: "Estado deseado para el ticket después del envío (open, pending o closed)"
							},
							responses: {
								200: "Mensaje enviado con éxito",
								401: "No autorizado - Token inválido o ausente",
								500: "Error del servidor"
							},
							exampleTitle: "Ejemplo de envío de mensaje con archivo:",
							exampleComment: "Para enviar un archivo, descomente las líneas a continuación:"
						},
						sendPdfLink: {
							description: "Envía un mensaje con un enlace a un archivo PDF.",
							params: {
								number: "Número del destinatario (incluyendo el código de país y DDD, sin caracteres especiales)",
								url: "URL del PDF a enviar",
								caption: "Leyenda para enviar junto con el enlace"
							},
							responses: {
								200: "Enlace para PDF enviado con éxito",
								401: "No autorizado - Token inválido o ausente",
								500: "Error del servidor"
							},
							exampleTitle: "Ejemplo de envío de enlace para PDF:"
						},
						sendImageLink: {
							description: "Envía un mensaje con un enlace a una imagen.",
							params: {
								number: "Número del destinatario (incluyendo el código de país y DDD, sin caracteres especiales)",
								url: "URL de la imagen a enviar",
								caption: "Leyenda para enviar junto con la imagen"
							},
							responses: {
								200: "Enlace para imagen enviado con éxito",
								401: "No autorizado - Token inválido o ausente",
								500: "Error del servidor"
							}
						},
						checkNumber: {
							description: "Verifica si un número es válido y está registrado en WhatsApp.",
							params: {
								number: "Número a verificar (incluyendo el código de país y DDD, sin caracteres especiales)"
							},
							responses: {
								200: "Número verificado con éxito",
								400: "Número inválido o no encontrado en WhatsApp",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						internalMessage: {
							description: "Crea un mensaje interno en un ticket existente sin enviar a WhatsApp.",
							params: {
								ticketId: "ID del ticket donde se agregará el mensaje",
								body: "Contenido del mensaje interno",
								medias: "Archivos multimedia para adjuntar (opcional)"
							},
							responses: {
								200: "Mensaje interno creado con éxito",
								401: "No autorizado - Token inválido o ausente",
								500: "Error del servidor"
							}
						},
						createTicket: {
							description: "Crea un nuevo ticket asociado a un contacto.",
							params: {
								contactId: "ID del contacto para asociar al ticket",
								status: "Estado inicial del ticket (open, pending, closed)",
								userId: "ID del usuario responsable del ticket (opcional)",
								queueId: "ID de la cola para asociar al ticket (opcional)",
								whatsappId: "ID del WhatsApp a utilizar (opcional)"
							},
							responses: {
								201: "Ticket creado con éxito",
								401: "No autorizado - Token inválido o ausente",
								500: "Error del servidor"
							}
						},
						closeTicket: {
							description: "Cambia el estado de un ticket a 'cerrado'.",
							params: {
								ticketId: "ID del ticket a cerrar"
							},
							responses: {
								200: "Ticket cerrado con éxito",
								401: "No autorizado - Token inválido o ausente",
								500: "Error del servidor"
							}
						},
						updateQueueTicket: {
							description: "Actualiza la cola asociada a un ticket específico.",
							params: {
								ticketId: "ID del ticket a actualizar",
								queueId: "ID de la nueva cola para el ticket"
							},
							responses: {
								200: "Cola del ticket actualizada con éxito",
								400: "Cola inválida o no pertenece a la empresa",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						addTagToTicket: {
							description: "Asocia una etiqueta específica a un ticket.",
							params: {
								ticketId: "ID del ticket a actualizar",
								tagId: "ID de la etiqueta a agregar al ticket"
							},
							responses: {
								200: "Etiqueta agregada al ticket con éxito",
								400: "Etiqueta inválida o ya asociada al ticket",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						removeTagFromTicket: {
							description: "Elimina la asociación entre una etiqueta y un ticket.",
							params: {
								ticketId: "ID del ticket del cual se eliminará la etiqueta",
								tagId: "ID de la etiqueta a eliminar"
							},
							responses: {
								200: "Etiqueta eliminada del ticket con éxito",
								400: "La etiqueta no está asociada al ticket",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						listTickets: {
							description: "Devuelve la lista de tickets asociados a la empresa del token.",
							params: {
								companyId: "ID de la empresa (opcional, se obtendrá del token si no se proporciona)"
							},
							responses: {
								200: "Tickets listados con éxito",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						listTicketsByTag: {
							description: "Devuelve los tickets que tienen una etiqueta determinada.",
							params: {
								tagId: "ID de la etiqueta para filtrar los tickets"
							},
							responses: {
								200: "Tickets listados con éxito",
								400: "Etiqueta inválida o no pertenece a la empresa",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						createPBXTicket: {
							description: "Crea un ticket interno basado en información de una llamada telefónica.",
							params: {
								phoneNumber: "Número de teléfono del contacto",
								contactName: "Nombre del contacto (usado si el contacto no existe)",
								status: "Estado inicial del ticket (open, pending, closed)",
								ramal: "Número de extensión que atendió/originó la llamada",
								idFilaPBX: "ID de la cola en el sistema PBX",
								message: "Mensaje interno para agregar al ticket",
								medias: "Archivos multimedia para agregar al ticket"
							},
							responses: {
								201: "Ticket PBX creado con éxito",
								400: "Parámetros inválidos o faltantes",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						getTicketHistory: {
							description: "Devuelve los tickets con sus mensajes dentro de un rango de fechas.",
							params: {
								startDate: "Fecha inicial (YYYY-MM-DD)",
								endDate: "Fecha final (YYYY-MM-DD)",
								contactNumber: "Número de contacto para filtrar (opcional)"
							},
							responses: {
								200: "Historial de tickets obtenido con éxito",
								400: "Parámetros inválidos",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						listContacts: {
							description: "Devuelve la lista de contactos asociados a la empresa del token.",
							params: {
								companyId: "ID de la empresa (opcional, se obtendrá del token si no se proporciona)"
							},
							responses: {
								200: "Contactos listados con éxito",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						searchContacts: {
							description: "Devuelve una lista paginada de contactos con opción de filtro por término de búsqueda.",
							params: {
								searchParam: "Término para búsqueda en el nombre o número del contacto",
								pageNumber: "Número de página para paginación",
								companyId: "ID de la empresa (opcional, se obtendrá del token si no se proporciona)"
							},
							responses: {
								200: "Contactos listados con éxito",
								401: "No autorizado - Token inválido o ausente",
								500: "Error del servidor"
							}
						},
						createCompany: {
							description: "Crea una nueva empresa con los datos proporcionados.",
							params: {
								name: "Nombre de la empresa",
								email: "Email principal de la empresa",
								phone: "Teléfono de contacto de la empresa",
								status: "Estado activo/inactivo de la empresa"
							},
							responses: {
								200: "Empresa creada con éxito",
								400: "Error de validación",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						updateCompany: {
							description: "Actualiza los datos de una empresa existente.",
							params: {
								id: "ID de la empresa a actualizar",
								name: "Nombre de la empresa",
								email: "Email principal de la empresa",
								phone: "Teléfono de contacto de la empresa",
								status: "Estado activo/inactivo de la empresa"
							},
							responses: {
								200: "Empresa actualizada con éxito",
								400: "Error de validación",
								401: "No autorizado - Token inválido o ausente",
								404: "Empresa no encontrada"
							}
						},
						blockCompany: {
							description: "Establece el estado de una empresa como inactivo (bloqueado).",
							params: {
								companyId: "ID de la empresa a bloquear"
							},
							responses: {
								200: "Empresa bloqueada con éxito",
								401: "No autorizado - Token inválido o ausente",
								404: "Empresa no encontrada"
							}
						},
						listInvoices: {
							description: "Devuelve la lista de facturas asociadas a la empresa del token.",
							params: {
								companyId: "ID de la empresa (opcional, se obtendrá del token si no se proporciona)"
							},
							responses: {
								200: "Facturas listadas con éxito",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						getInvoice: {
							description: "Devuelve los detalles de una factura específica.",
							params: {
								Invoiceid: "ID de la factura a mostrar"
							},
							responses: {
								200: "Detalles de la factura obtenidos con éxito",
								401: "No autorizado - Token inválido o ausente"
							}
						},
						getDashboardOverview: {
							description: "Devuelve métricas y datos estadísticos para el dashboard.",
							params: {
								period: "Período para análisis ('day', 'week' o 'month')",
								date: "Fecha de referencia (YYYY-MM-DD)",
								userId: "ID del usuario para filtrar (opcional)",
								queueId: "ID de la cola para filtrar (opcional)"
							},
							responses: {
								200: "Datos del dashboard obtenidos con éxito",
								400: "Error de validación",
								401: "No autorizado - Token inválido o ausente",
								500: "Error interno del servidor"
							},
							exampleTitle: "Ejemplo de obtención de datos del dashboard:"
						}
					}
				}
			},
			financial: {
				title: "Financiero",
				selectCompany: "Seleccionar Empresa",
				allCompanies: "Todas las Empresas",
				company: "Empresa",
				value: "Valor",
				dueDate: "Vencimiento",
				invalidDate: "Fecha inválida",
				dueDateRequired: "La fecha de vencimiento es obligatoria",
				dueDateFuture: "La fecha debe ser futura",
				dateNotInformed: "Fecha no informada",
				viewInvoice: "Ver Factura",
				from: "De",
				to: "Para",
				description: "Descripción",
				payOnline: "Pague en línea a través de PIX",
				terms: "Esta factura fue generada automáticamente. Para más información, contáctenos.",
				status: {
					tableHeader: "Estado",
					allStatus: "Todos los estados",
					paid: "Pagado",
					pending: "Pendiente",
					open: "Abierto",
					overdue: "Vencido"
				},
				actions: "Acciones",
				editDueDate: "Editar Fecha de Vencimiento",
				sendEmail: "Enviar Email",
				sendWhatsapp: "Enviar WhatsApp",
				deleteInvoice: "Eliminar Factura",
				payInvoice: "Pagar Factura",
				pay: "Pagar",
				confirmDelete: "Confirmar Eliminación",
				deleteWarning: "Esta acción no se puede deshacer.",
				deleteConfirmation: "¿Está seguro de que desea eliminar esta factura?",
				invoice: "Factura",
				newDueDate: "Nueva Fecha de Vencimiento",
				cancel: "Cancelar",
				confirm: "Confirmar",
				dueDateUpdated: "Fecha de vencimiento actualizada con éxito",
				invoiceDeleted: "Factura eliminada con éxito",
				emailSent: "Email enviado con éxito",
				whatsappSent: "Mensaje de WhatsApp enviado con éxito",
				errorLoadingCompanies: "Error al cargar empresas",
				errorLoadingInvoices: "Error al cargar las facturas",
				errorUpdatingDueDate: "Error al actualizar la fecha de vencimiento",
				errorDeletingInvoice: "Error al eliminar la factura",
				errorSendingEmail: "Error al enviar email",
				errorSendingWhatsapp: "Error al enviar el mensaje de WhatsApp",
				noCompanyAccess: "El usuario no tiene una empresa asociada",
				noInvoices: "No se encontraron facturas",
				accessDenied: "Acceso no autorizado",
				superUserIndicator: "Usuario Super",
				emitter: "Emisor",
				recipient: "Destinatario",
				invoiceNumber: "Factura #%{number}",
				tableInvoice: "Factura #",
				companyLogo: "Logo de la Empresa",
				closeModal: "Cerrar modal",
				errorLoadingCompany: "Error al cargar los datos de la empresa",
				loading: "Cargando...",
				companyDetails: "Detalles de la Empresa",
				paymentInstructions: "Instrucciones de Pago",
				generatedAt: "Generado en",
				payWithPix: "Pague con PIX",
				pixCode: "Código PIX (haga clic para copiar)",
				pixCopied: "¡Código PIX copiado!",
				scanQrCode: "Escanee el código QR",
				copyPixCode: "Copiar código PIX",
				filterStatus: "Estado",
				allStatus: "Todos los estados"
			},
			deleteConfirmationDialog: {
				cancelButton: "Cancelar",
				confirmButton: "Confirmar Eliminación",
				defaultTitle: "Confirmar Eliminación",
				defaultWarning: "¡Esta acción no se puede deshacer!",
				defaultConfirmation: "¿Está seguro de que desea eliminar este elemento?"
			},
			errors: {
				required: "Este campo es obligatorio",
				invalid: "Valor inválido",
				invalidEmail: "Email inválido",
				invalidPhone: "Teléfono inválido",
				invalidCep: "CEP inválido",
				invalidCpf: "CPF inválido",
				invalidCnpj: "CNPJ inválido",
				minLength: "Mínimo de {min} caracteres",
				maxLength: "Máximo de {max} caracteres"
			},
			modal: {
				scheduling: {
					title: "Horario de Reserva",
					description: "Todas las programaciones se enviarán entre las 18:00 y las 18:30."
				},
				recurring: {
					title: "Reserva Recurrente",
					steps: {
						intro: "Siga estos pasos:",
						step1: "Ir a la pestaña de Etiquetas de Campaña",
						step2: "Cree nuevas etiquetas, si es necesario",
						substeps: {
							title: "Configure su campaña:",
							settings: "Vaya a la configuración del engranaje",
							board: "Seleccione uno de los tableros disponibles",
							message: "Cambie el mensaje que se enviará",
							file: "Si es necesario, elija un archivo para enviar",
							frequency: "Elija la frecuencia de la reserva (cada cuántos días)",
							save: "Haga clic en Guardar"
						}
					}
				},
				openTickets: {
					title: "Tickets Sin Campañas Activas",
					description: "Todos los tickets sin campañas activas entrarán en el tablero \"En Abierto\""
				},
				campaign: {
					title: "Crear una Campaña",
					description: "Para crear una campaña, arrastre el ticket al tablero de campaña de su elección"
				},
				moving: {
					title: "Mover Tickets entre Tableros",
					rules: {
						rule1: "Al mover un ticket a un tablero, las reservas se harán según la configuración del tablero",
						rule2: "Al mover un ticket a otro tablero, las reservas existentes se eliminarán y se creará una nueva reserva según el tablero elegido",
						rule3: "Al mover un ticket de vuelta al tablero \"En Abierto\", las reservas existentes del ticket se eliminarán"
					}
				},
				close: "Cerrar modal"
			},
			splash: {
				title: "AutoAtende",
				subtitle: "Atención Inteligente",
				loading: "Cargando...",
				initializing: "Iniciando...",
				loadingResources: "Cargando recursos...",
				preparingInterface: "Preparando interfaz...",
				configuringEnvironment: "Configurando entorno...",
				finishingUp: "Finalizando..."
			},
			home: {
				nav: {
					features: "Funcionalidades",
					pricing: "Precios",
					about: "Acerca de",
					login: "Iniciar sesión",
					getStarted: "Comenzar Ahora"
				},
				hero: {
					title: "Transforme su Atención con IA",
					subtitle: "Automatice, optimice y escale su atención al cliente con soluciones inteligentes basadas en inteligencia artificial.",
					cta: {
						primary: "Prueba Gratuita",
						secondary: "Más Información"
					}
				},
				stats: {
					clients: "Clientes Activos",
					uptime: "Disponibilidad",
					support: "Soporte al Cliente"
				},
				features: {
					title: "Funcionalidades Poderosas",
					subtitle: "Todo lo que necesita para ofrecer una atención excepcional",
					chatbot: {
						title: "Chatbot con IA",
						description: "Respuestas automatizadas inteligentes con procesamiento avanzado de lenguaje natural."
					},
					messaging: {
						title: "Mensajes Unificados",
						description: "Administre todas las conversaciones con sus clientes en una única plataforma centralizada."
					},
					ai: {
						title: "Análisis con IA",
						description: "Obtenga información profunda sobre las interacciones con los clientes y el rendimiento del servicio."
					},
					automation: {
						title: "Automatización Inteligente",
						description: "Automatice tareas rutinarias y concéntrese en lo que realmente importa."
					},
					security: {
						title: "Seguridad Empresarial",
						description: "Seguridad y protección de datos de nivel bancario para su tranquilidad."
					},
					api: {
						title: "API para Desarrolladores",
						description: "Integre fácilmente con sus sistemas y flujos de trabajo existentes."
					}
				},
				pricing: {
					title: "Precios Simples y Transparentes",
					subtitle: "Elija el plan que mejor se adapte a sus necesidades",
					popularLabel: "Más Popular",
					ctaButton: "Comenzar Ahora",
					basic: {
						title: "Básico",
						feature1: "1 Operador",
						feature2: "1 Canal WhatsApp",
						feature3: "Tablero Básico",
						feature4: "Soporte por Correo Electrónico"
					},
					pro: {
						title: "Profesional",
						feature1: "5 Operadores",
						feature2: "3 Canales WhatsApp",
						feature3: "Análisis Avanzados",
						feature4: "Soporte Prioritario"
					},
					enterprise: {
						title: "Empresarial",
						feature1: "Operadores Ilimitados",
						feature2: "Canales Ilimitados",
						feature3: "Integración Personalizada",
						feature4: "Soporte 24/7"
					}
				},
				footer: {
					description: "AutoAtende ayuda a las empresas a ofrecer un servicio excepcional a través de la automatización con inteligencia artificial.",
					product: {
						title: "Producto",
						features: "Funcionalidades",
						pricing: "Precios",
						api: "API"
					},
					company: {
						title: "Empresa",
						about: "Sobre Nosotros",
						contact: "Contacto",
						careers: "Carreras"
					},
					legal: {
						title: "Legal",
						privacy: "Política de Privacidad",
						terms: "Términos de Servicio",
						cookies: "Política de Cookies"
					},
					rights: "Todos los derechos reservados."
				}
			},
			connections: {
				title: "Conexiones",
				noConnections: "No se encontró ninguna conexión",
				buttons: {
					add: "Agregar conexión",
					restartAll: "Reiniciar todo",
					qrCode: "Ver Código QR",
					tryAgain: "Intentar de nuevo",
					disconnect: "Desconectar",
					newQr: "Nuevo Código QR",
					connecting: "Conectando...",
					refreshQrCode: "Actualizar Código QR",
					generatingQrCode: "Generando Código QR...",
					generateQrCode: "Generar Código QR",
					showQrCode: "Mostrar Código QR"
				},
				status: {
					disconnected: "Desconectado"
				},
				menu: {
					duplicate: "Duplicar conexión",
					transferTickets: "Transferir tickets y eliminar",
					delete: "Eliminar conexión",
					forceDelete: "Forzar eliminación",
					importMessages: "Importar Mensajes"
				},
				confirmationModal: {
					deleteTitle: "Eliminar conexión",
					deleteMessage: "¿Está seguro de que desea eliminar esta conexión? Se perderán todas las atenciones relacionadas.",
					disconnectTitle: "Desconectar sesión",
					disconnectMessage: "¿Está seguro de que desea desconectar esta sesión?",
					forceDeleteTitle: "Forzar eliminación",
					forceDeleteMessage: "ATENCIÓN: Esta acción eliminará la conexión incluso si hay tickets abiertos. ¿Está seguro?",
					transferTitle: "Transferir Tickets",
					transferMessage: "Seleccione la conexión de destino para los tickets:"
				},
				toasts: {
					deleted: "Conexión eliminada con éxito.",
					deleteError: "Error al eliminar la conexión.",
					disconnected: "Conexión desconectada con éxito.",
					disconnectError: "Error al desconectar la conexión.",
					qrCodeGenerated: "Código QR generado con éxito.",
					qrCodeError: "Error al generar el Código QR.",
					reconnectRequested: "Reconexión solicitada con éxito.",
					reconnectError: "Error al solicitar la reconexión.",
					connectionStarted: "Iniciando sesión...",
					startError: "Error al iniciar sesión.",
					fetchError: "Error al buscar conexiones.",
					restartSuccess: "Todas las conexiones se están reiniciando.",
					duplicated: "Conexión duplicada con éxito.",
					duplicateError: "Error al duplicar la conexión.",
					transferSuccess: "Tickets transferidos y conexión eliminada con éxito.",
					transferError: "Error al transferir tickets."
				},
				table: {
					name: "Nombre",
					number: "Número",
					status: "Estado",
					default: "Patrón",
					lastUpdate: "Última actualización",
					session: "Sesión",
					actions: "Acciones"
				},
				import: {
					title: "Importación de Mensajes",
					preparingImport: "Preparando importación...",
					pleaseWait: "Por favor, espere mientras preparamos los datos para la importación.",
					importingMessages: "Importando mensajes",
					progress: "Progreso",
					doNotClose: "No cierre esta ventana mientras la importación esté en curso.",
					importComplete: "Importación completada",
					messagesImported: "{count} mensajes se importaron con éxito.",
					closeTicketsTitle: "Cerrar tickets importados",
					closeTicketsDescription: "Puede cerrar automáticamente todos los tickets creados durante la importación para mantener organizado su espacio de trabajo.",
					closeTicketsButton: "Cerrar tickets importados",
					importError: "Error en la importación",
					genericError: "Se produjo un error durante el proceso de importación.",
					refresh: "Actualizar página"
				}
			},
			qrCode: {
				title: "QR Code",
				instructions: "Escanee el Código QR con su teléfono para conectar",
				timeRemaining: "Tiempo restante",
				noQrFound: "No se encontró ningún Código QR",
				expired: "Código QR caducado. Haga clic para generar uno nuevo",
				connected: "¡Conectado con éxito!"
			},
			fileImport: {
				title: "Importación de Archivos",
				startButton: "Iniciar Importación",
				companyRequired: "Empresa es obligatoria",
				processedFiles: "{{processed}} de {{total}} archivos procesados",
				errors: "{{count}} errores encontrados",
				successMessage: "Importación completada con éxito! {{total}} archivos procesados.",
				errorMessage: "Error durante la importación. Por favor, inténtelo de nuevo.",
				startError: "Error al iniciar la importación",
				complete: "Importação concluída com sucesso!",
				error: "Erro durante a importação"
			},
			oldsettings: {
				tabs: {
					ai: "Inteligencia Artificial",
					generalParams: "Parámetros Generales",
					advanced: "Configuraciones Avanzadas"
				},
				openai: {
					label: "Modelo OpenAI",
					helper: "Elija el modelo de inteligencia artificial OpenAI para utilizar en las respuestas automáticas. Fundamental para garantizar la calidad y precisión de las respuestas automáticas, mejorando la eficiencia del servicio.",
					models: {
						gpt4o: "GPT-4o - Modelo principal para tareas complejas",
						gpt4oMini: "GPT-4o Mini - Modelo ligero y rápido",
						gpt4Turbo: "GPT-4 Turbo - Última versão com capacidades de visão",
						o1Preview: "O1 Preview - Modelo enfocado en razonamiento",
						o1Mini: "O1 Mini - Modelo rápido para código y matemática"
					}
				},
				downloadLimit: {
					label: "Límite de Descarga (MB)",
					helper: "Establece el límite máximo para la descarga de archivos en megabytes"
				},
				oneTicket: {
					label: "Activar uso de un ticket por conexión",
					helper: "Al activar esta función, cada conexión diferente del cliente generará un ticket distinto"
				},
				signup: {
					label: "Habilitar registro en el signup",
					helper: "Permite que nuevos usuarios se registren en la plataforma"
				},
				emailRegister: {
					label: "Enviar correo electrónico en el registro",
					helper: "Envía email de confirmación usando la empresa principal"
				},
				messageRegister: {
					label: "Enviar mensaje en el registro",
					helper: "Envía mensaje de bienvenida al registrarse"
				},
				closeTicketReason: {
					label: "Mostrar motivo al cerrar ticket",
					helper: "Solicita motivo del cierre al finalizar atención"
				},
				showSku: {
					label: "Mostrar valor del ticket y SKU",
					helper: "Muestra información de valor y SKU durante atención"
				},
				quickMessages: {
					label: "Mensajes Rápidos",
					company: "Por Empresa",
					individual: "Por Usuario",
					helper: "Define cómo se organizarán los mensajes rápidos"
				},
				greetingMessage: {
					label: "Enviar saludo al aceptar ticket",
					helper: "Envía mensaje automático al aceptar atención"
				},
				userRating: {
					label: "Evaluación del usuario",
					helper: "Permite que los clientes evalúen la atención"
				},
				schedule: {
					label: "Gestión de Expediente",
					disabled: "Desactivado",
					company: "Por Empresa",
					queue: "Por Sector",
					helper: "Define cómo se controlará el horario de atención"
				},
				ignoreGroup: {
					label: "Ignorar mensajes de grupo",
					helper: "No procesa mensajes provenientes de grupos"
				},
				acceptCalls: {
					label: "Aceptar llamadas",
					helper: "Permite recibir llamadas de voz y vídeo"
				},
				chatbot: {
					label: "Tipo de Chatbot",
					text: "Texto",
					helper: "Define el formato de interacción del chatbot"
				},
				transferMessage: {
					label: "Mensaje de transferencia",
					helper: "Envía mensaje al transferir atención"
				},
				queueGreeting: {
					label: "Saludo en sector único",
					helper: "Envía saludo cuando hay solo un sector"
				},
				smtp: {
					title: "SMTP",
					server: "Servidor SMTP",
					username: "Usuario SMTP",
					password: "Contraseña SMTP",
					port: "Puerto SMTP"
				},
				support: {
					title: "Soporte",
					whatsapp: "WhatsApp de Soporte",
					message: "Mensaje estándar"
				},
				apiToken: {
					label: "Token de la API",
					copied: "Token copiado al portapapeles",
					generate: "Generar nuevo token",
					delete: "Eliminar token"
				},
				success: "Operación realizada con éxito",
				loading: "Actualizando...",
				error: "Se produjo un error en la operación",
				save: "Guardar",
				cancel: "Cancelar"
			},
			satisfactionSurvey: {
				tooltip: "Tiene {{count}} encuesta(s) de satisfacción pendiente(s)",
				reminderTitle: "¡Su opinión es importante!",
				reminderMessage: "Tiene {{count}} encuesta(s) de satisfacción esperando respuesta.",
				reminderSubtext: "Su evaluación nos ayuda a mejorar continuamente el AutoAtende.",
				remindLater: "Recordar más tarde",
				openNow: "Responder ahora"
			},
			flowBuilder: {
				list: {
					title: "Constructor de Flujos",
					searchPlaceholder: "Buscar por nombre",
					newFlow: "Nuevo Flujo",
					name: "Nombre",
					whatsapp: "WhatsApp",
					status: "Estado",
					createdAt: "Creado en",
					actions: "Acciones",
					active: "Activo",
					inactive: "Inactivo",
					edit: "Editar",
					test: "Probar",
					delete: "Eliminar",
					duplicate: "Duplicar",
					duplicateSuccess: "Flujo duplicado con éxito",
					duplicateError: "Error al duplicar flujo",
					importFlow: "Importar Flujo",
					createFirst: "Cree ahora mismo el primer flujo",
					createSuccess: "Flujo creado con éxito",
					confirmDelete: "Confirmar eliminación",
					confirmDeleteMessage: "¿Estás seguro de que deseas eliminar el flujo {{name}}?",
					noFlows: "No se encontró ningún flujo",
					noSearchResults: "No se encontró ningún flujo con los criterios de búsqueda",
					fetchError: "Error al buscar flujos",
					deleteError: "Error al eliminar flujo",
					deleteSuccess: "Flujo eliminado con éxito",
					testError: "Error al probar flujo",
					testSuccess: "Prueba de flujo iniciada con éxito",
					toggleError: "Error al cambiar el estado del flujo"
				},
				import: {
					title: "Importar Flujo",
					instruction: "Seleccione o arrastre un archivo JSON de flujo exportado previamente.",
					dropFile: "Haga clic o arrastre un archivo aquí",
					fileFormat: "Solo se aceptan archivos JSON",
					noFileSelected: "Por favor, seleccione un archivo para importar",
					success: "Flujo importado con éxito",
					error: "Error al importar el flujo",
					action: "Importar"
				},
				create: "Crear",
				editing: "Editando flujo",
				createNew: "Crear nuevo flujo",
				save: "Guardar",
				test: "Probar",
				validate: "Validar",
				preview: {
					title: "Vista Previa",
					simulation: "Simulación del flujo",
					welcome: "Iniciando simulación del flujo...",
					startNode: "Flujo iniciado",
					endNode: "Flujo finalizado",
					terminalNode: "Flujo finalizado",
					switchFlow: "Cambio de flujo a",
					attendantNode: "Transferencia a agente humano...",
					apiCall: "Llamada API para",
					apiSuccess: "¡Llamada completada con éxito!",
					evaluating: "Evaluando variable:",
					conditionMatch: "Condición correspondiente",
					defaultPath: "Siguiendo camino estándar",
					typeMessage: "Ingrese un mensaje...",
					disabled: "Simulación en progreso...",
					restart: "Reiniciar simulación",
					pauseAuto: "Pausar reproducción automática",
					playAuto: "Iniciar reproducción automática",
					next: "Siguiente paso",
					completed: "Simulación completada",
					waitingInput: "Esperando entrada del usuario",
					inProgress: "En progreso",
					openaiCall: "Iniciando integración con OpenAI: {name}",
					openaiResponse: "¡Respuesta de OpenAI generada con éxito!",
					tagOperation: "Ejecutando nodo de TAG",
					queueTransfer: "Ejecutando nodo de transferencia de Cola",
					withVoice: "Respuesta convertida en audio",
					typebotStart: "Iniciando flujo de Typebot: {name}",
					typebotComplete: "Flujo de Typebot: {name} completado con éxito",
					menuTitle: "Menú presentado al usuario",
					menuOption: "Opción de menú seleccionada",
					inputRequired: "Por favor, proporcione una respuesta del tipo: {type}",
					validationRequired: "La respuesta se validará como: {type}",
					validationFailed: "La respuesta no pasó la validación. Simulando flujo de error."
				},
				saveFlow: "Guardar flujo",
				close: "Cerrar",
				export: "Exportar flujo",
				validationErrorOutput: "Salida para error",
				success: {
					saved: "Flujo guardado con éxito",
					testStarted: "Prueba iniciada con éxito",
					exported: "Flujo exportado con éxito"
				},
				validation: {
					nameRequired: "El nombre es obligatorio",
					whatsappRequired: "Es necesario seleccionar un WhatsApp",
					apiKeyRequired: "La clave de API es obligatoria",
					promptRequired: "El indicio es obligatorio",
					urlRequired: "La URL es obligatoria",
					invalidUrl: "URL inválida",
					typebotIdRequired: "El ID de Typebot es obligatorio",
					fixErrors: "Por favor, corrija los errores antes de guardar"
				},
				outputs: {
					success: "Éxito",
					error: "Error",
					below: "abajo",
					right: "a la derecha",
					noSelection: "Ninguna selección"
				},
				errors: {
					loadFailed: "Error al cargar flujo",
					saveFailed: "Error al guardar flujo",
					testFailed: "Error al iniciar prueba",
					exportFailed: "Error al exportar el flujo"
				},
				form: {
					name: "Nombre del flujo",
					description: "Descripción",
					whatsapp: "WhatsApp",
					selectWhatsapp: "Seleccione un WhatsApp"
				},
				sidebar: {
					nodes: "Nodos disponibles",
					dragHelp: "Arrastra los nodos al flujo",
					connectHelp: "Conecta los nodos para crear tu flujo",
					help: "Ayuda",
					messageNodes: "MENSAJES",
					flowNodes: "FLUJO",
					integrationNodes: "INTEGRACIONES",
					helpTooltip: "Documentación de los nodos",
					tagDescription: "Añade o elimina etiquetas de los contactos"
				},
				help: {
					title: "Documentação dos Nós",
					introduction: "Los nodos son los elementos básicos para la construcción de flujos. Cada tipo de nodo tiene funcionalidades específicas y puede ser configurado para diferentes comportamientos. Esta documentación proporciona información detallada sobre cada tipo de nodo disponible en el sistema.",
					propertiesSection: "Propiedades",
					connectionsSection: "Conexiones",
					usageSection: "Cómo Usar",
					exampleSection: "Ejemplo:",
					propertyName: "Propiedad",
					propertyDescription: "Descripción",
					connectionType: "Tipo",
					connectionDescription: "Descripción",
					menuNode: {
						title: "Menú",
						description: "Este nodo crea un menú interactivo con opciones para que el usuario elija.",
						properties: {
							label: "Etiqueta identificadora del nodo (opcional)",
							menuTitle: "Título que se mostrará en el menú",
							menuOptions: "Lista de opciones del menú que el usuario puede seleccionar",
							useEmoji: "Opción para utilizar emojis en las opciones del menú"
						},
						connections: {
							defaultOutput: "Salida estándar utilizada cuando no se selecciona ninguna opción",
							optionOutputs: "Una salida para cada opción del menú, permitiendo diferentes flujos basados en la elección del usuario"
						},
						usage: "Utiliza este nodo para presentar un conjunto de opciones para que el usuario elija, creando interacciones dirigidas y ramificaciones en el flujo.",
						example: "Un menú para que el usuario elija qué tipo de atención desea: \"Soporte Técnico\", \"Ventas\", \"Reclamaciones\"."
					},
					properties: {
						label: "Etiqueta",
						messageType: "Tipo de Mensaje",
						message: "Mensaje",
						mediaUrl: "URL de Medios",
						caption: "Leyenda",
						question: "Pregunta",
						variableName: "Nombre de la Variable",
						inputType: "Tipo de Entrada",
						options: "Opciones",
						variable: "Variable",
						conditions: "Condiciones",
						targetFlow: "Flujo Destino",
						transferVariables: "Transferir Variables",
						assignmentType: "Tipo de Asignación",
						assignedUser: "Agente Asignado",
						timeout: "Tiempo de espera",
						endFlow: "Finalizar Flujo",
						method: "Método HTTP",
						url: "URL",
						headers: "Encabezados",
						secretKey: "Clave Secreta",
						contentType: "Tipo de Contenido",
						body: "Cuerpo (Body)",
						queryParams: "Parámetros de Consulta",
						responseVariable: "Variable de Respuesta",
						responseFilter: "Filtro de Respuesta",
						authentication: "Autenticación",
						validationType: "Tipo de validación",
						useValidationErrorOutput: "Utilizar salida para error"
					},
					connections: {
						input: "Entrada",
						output: "Salida",
						singleInput: "Una entrada en la parte superior del nodo",
						singleOutput: "Una salida en la parte inferior del nodo"
					},
					messageNode: {
						title: "Nodo de Mensaje",
						description: "El nodo de mensaje permite enviar un mensaje de texto simple al contacto. Es el tipo de nodo más básico y más utilizado.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							messageType: "Tipo de mensaje (texto, imagen, audio, video, archivo)",
							message: "Contenido del mensaje a enviar",
							mediaUrl: "URL de los medios a enviar (para tipos no texto)"
						},
						usage: "Use este nó para enviar informações, instruções ou conteúdo multimídia para o contato. É ideal para fornecer informações ou instruções antes de fazer perguntas.",
						example: "Enviar un mensaje de bienvenida, explicar cómo funciona un servicio, o enviar una imagen promocional."
					},
					imageNode: {
						title: "Nodo de Imagen",
						description: "El nodo de imagen permite enviar una imagen al contacto, con la opción de incluir una leyenda explicativa.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							mediaUrl: "La imagen a enviar (subir o URL)",
							caption: "Texto opcional que acompaña a la imagen"
						},
						usage: "Utiliza este nodo cuando necesites enviar imágenes como fotos de productos, instrucciones visuales, infografías o cualquier contenido visual.",
						example: "Enviar un catálogo de productos, un mapa de ubicación, o un banner promocional."
					},
					queueNode: {
						title: "Sector",
						description: "Este nodo transfiere la atención a un sector específico y finaliza el flujo.",
						properties: {
							label: "Etiqueta identificadora del nodo (opcional)",
							queue: "Sector al que se transferirá la atención"
						},
						connections: {
							output: "Sin salida - finaliza el flujo y transfiere al sector"
						},
						usage: "Utiliza este nodo cuando necesites transferir la atención a un sector específico y finalizar el flujo actual. El ticket quedará pendiente en el sector seleccionado.",
						example: "Un cliente solicita atención especializada, y transfieres el ticket al sector de \"Soporte Técnico\", finalizando el flujo del bot."
					},
					openaiNode: {
						title: "Nodo OpenAI",
						description: "El nodo OpenAI permite integrar inteligencia artificial a tu flujo, generando respuestas basadas en modelos de lenguaje avanzados.",
						properties: {
							label: "Etiqueta para identificación del nodo en el flujo",
							name: "Nombre de la integración para referencia",
							apiKey: "Clave API para autenticación en el servicio OpenAI",
							prompt: "Instrucciones detalladas para dirigir el comportamiento del modelo",
							voice: "Opción para convertir texto en voz con voces disponibles",
							temperature: "Controla la aleatoriedad de las respuestas (0-2)",
							maxTokens: "Limita el tamaño de la respuesta generada",
							maxMessages: "Define el número máximo de interacciones para contexto"
						},
						usage: "Utiliza para crear asistentes virtuales, responder preguntas con IA o generar contenido dinámico basado en las entradas del usuario.",
						example: "Un asistente virtual que responde preguntas sobre productos de la empresa, utilizando un mensaje personalizado para garantizar respuestas precisas y alineadas con la marca."
					},
					typebotNode: {
						title: "Nodo Typebot",
						description: "El nodo Typebot permite integrar flujos externos creados en la plataforma Typebot, posibilitando experiencias conversacionales complejas y personalizadas.",
						properties: {
							label: "Etiqueta para identificación del nodo en el flujo",
							name: "Nombre de la integración para referencia",
							typebotUrl: "URL base de Typebot donde el flujo está alojado",
							typebotId: "Identificador único del flujo Typebot a integrar",
							typebotToken: "Token de autenticación para acceder a flujos protegidos",
							saveResponse: "Opción para almacenar las respuestas del usuario en el flujo Typebot"
						},
						usage: "Úselo para integrar flujos complejos preconstruidos, cuestionarios, formularios o procesos de recopilación de datos estructurados.",
						example: "Un proceso de calificación de clientes potenciales que utiliza un Typebot para recopilar información específica del cliente antes de derivarlo a un agente humano."
					},
					questionNode: {
						title: "Nodo de Pregunta",
						description: "El nodo de pregunta permite hacer una pregunta al contacto y capturar su respuesta, pudiendo ofrecer opciones predefinidas o aceptar respuestas libres.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							question: "La pregunta a enviar al contacto",
							variableName: "Nombre de la variable donde se almacenará la respuesta",
							inputType: "Tipo de respuesta esperado (opciones, texto, número, email, teléfono)",
							options: "Lista de opciones para que el contacto elija (cuando el tipo es \"opciones\")",
							validationType: "Define el tipo de validación que se aplicará a la respuesta",
							useValidationErrorOutput: "Crea una salida adicional para manejar errores de validación"
						},
						connections: {
							defaultOutput: "Salida estándar para tipo de texto libre o cuando ninguna opción coincide",
							optionOutputs: "Una salida para cada opción definida (cuando el tipo es \"opciones\")",
							validationErrorOutput: "Salida utilizada cuando la respuesta falla en la validación"
						},
						usage: "Utilice este nodo para interactuar con el contacto, recopilar información o dirigir el flujo según sus elecciones.",
						example: "Preguntar a qué departamento desea hablar el contacto, solicitar un correo electrónico para registro, o pedir una evaluación numérica del 1 al 5."
					},
					conditionalNode: {
						title: "Nodo de Condición",
						description: "El nodo de condición permite ramificar el flujo según el valor de una variable, creando caminos diferentes según la condición cumplida.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							variable: "Nombre de la variable a evaluar en las condiciones",
							conditions: "Lista de condiciones con valores esperados y destinos correspondientes"
						},
						connections: {
							defaultOutput: "Salida estándar cuando ninguna condición es cumplida",
							conditionOutputs: "Una salida para cada condición definida"
						},
						usage: "Utilice este nodo para crear ramificaciones en el flujo según información previamente recopilada o variables del sistema.",
						example: "Verificar si el cliente ya está registrado, dirigir a departamentos diferentes según la elección anterior, o personalizar el flujo según los datos del cliente."
					},
					endNode: {
						title: "Nodo de Fin",
						description: "El nodo de fin marca el final de un camino en el flujo. Cuando el flujo llega a este nodo, la ejecución se detiene para el contacto.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo"
						},
						connections: {
							output: "No tiene salidas"
						},
						usage: "Utilice este nodo para marcar el final de un camino en el flujo, finalizando la interacción automatizada.",
						example: "Finalizar la atención después de proporcionar la información solicitada, cerrar el flujo después de recopilar datos, o terminar una rama específica del flujo."
					},
					switchFlowNode: {
						title: "Nodo de Cambio de Flujo",
						description: "El nodo de cambio de flujo permite transferir la ejecución a otro flujo, posibilitando la modularización de los flujos en partes más pequeñas y reutilizables.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							targetFlow: "Flujo al que se transferirá la ejecución",
							transferVariables: "Opción para transferir las variables del flujo actual al nuevo flujo"
						},
						connections: {
							output: "No tiene salidas en el flujo actual, ya que la ejecución se transfiere a otro flujo"
						},
						usage: "Utilice este nodo para crear flujos modulares que pueden ser reutilizados en diferentes contextos o para organizar flujos complejos en partes más pequeñas.",
						example: "Transferir a un flujo de registro, iniciar un flujo de pago, o dirigir a un submenú específico."
					},
					attendantNode: {
						title: "Nodo de Agente",
						description: "El nodo de agente transfiere la conversación a un agente humano, permitiendo la continuación de la atención por un operador real.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							assignmentType: "Determina si la asignación será manual (para un agente específico) o automática (basada en sector)",
							assignedUser: "Agente específico al que se dirigirá la atención (cuando el tipo es \"manual\")",
							timeout: "Tiempo máximo de espera para la asignación de la atención",
							endFlow: "Determina si el flujo se cerrará después de la transferencia al agente"
						},
						connections: {
							output: "Una salida que se seguirá si la atención no se asigna dentro del tiempo de espera"
						},
						usage: "Utilice este nodo cuando el contacto necesite hablar con un agente humano, ya sea para resolver problemas complejos o proporcionar atención personalizada.",
						example: "Transferir a un agente después de intentos fallidos de resolución automatizada, dirigir a un especialista en un tema específico, o ofrecer atención humana como opción."
					},
					webhookNode: {
						title: "Nodo de Webhook",
						description: "El nodo de webhook permite realizar llamadas HTTP a sistemas externos, enviando y recibiendo datos para integración con otras plataformas.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							method: "Método de la solicitud (GET, POST, PUT, PATCH, DELETE)",
							url: "Dirección del endpoint al que se enviará la solicitud",
							headers: "Encabezados HTTP a enviar con la solicitud",
							variableName: "Nombre de la variable donde se almacenará la respuesta",
							secretKey: "Clave para firma HMAC de la solicitud (seguridad)"
						},
						usage: "Utilize este nó para integrar o fluxo com sistemas externos, buscar ou enviar dados para outras plataformas.",
						example: "Verificar el estado de un pedido en un comercio electrónico, enviar datos de registro a un CRM, o consultar información en una API externa."
					},
					apiNode: {
						title: "Nodo de Solicitud de API",
						description: "El nodo de Solicitud de API permite realizar llamadas API más elaboradas con configuraciones avanzadas, manejo de errores y procesamiento de respuestas.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							method: "Método de la solicitud (GET, POST, PUT, PATCH, DELETE)",
							url: "Dirección del endpoint al que se enviará la solicitud",
							headers: "Encabezados HTTP a enviar con la solicitud",
							contentType: "Tipo de contenido del cuerpo de la solicitud",
							body: "Datos a enviar en el cuerpo de la solicitud (para métodos que no son GET)",
							queryParams: "Parámetros a añadir a la URL como cadena de consulta",
							responseVariable: "Nombre de la variable donde se almacenará la respuesta",
							responseFilter: "Ruta JSONPath para extraer solo parte de la respuesta",
							authentication: "Configuraciones de autenticación (Basic Auth, Bearer Token, API Key)"
						},
						connections: {
							successOutput: "Salida seguida cuando la solicitud es exitosa",
							errorOutput: "Salida seguida cuando la solicitud falla"
						},
						usage: "Use este nó para integrações avançadas com APIs que exigem configurações específicas, tratamento de erros ou processamento de dados.",
						example: "Integrar con APIs de pago, sistemas CRM complejos, o servicios que requieren autenticación específica y manejo de respuestas elaborado."
					},
					tagNode: {
						title: "Nodo de Etiqueta",
						description: "El nodo de etiqueta permite agregar o eliminar etiquetas de los contactos. Las etiquetas son útiles para segmentación y automatización de campañas.",
						properties: {
							label: "Nombre de identificación del nodo en el flujo",
							operation: "Define si las etiquetas se agregarán o eliminarán del contacto",
							selectionMode: "Determina si se manejará solo una o múltiples etiquetas",
							tags: "Lista de etiquetas que se agregarán o eliminarán del contacto"
						},
						connections: {
							output: "Una salida que se seguirá después de la adición/eliminación de las etiquetas"
						},
						usage: "Utilice este nodo para agregar o eliminar etiquetas de los contactos durante el flujo de conversación, permitiendo segmentación futura.",
						example: "Agregar una etiqueta 'Interesado' cuando el contacto muestra interés en un producto, o eliminar la etiqueta 'No contactado' después de la primera interacción."
					}
				},
				openai: {
					name: "Nombre de la integración",
					apiKey: "Clave API OpenAI",
					prompt: "Prompt",
					promptHelp: "Ingrese las instrucciones para el modelo OpenAI",
					voice: "Voz",
					voiceKey: "Clave de la API de voz",
					voiceRegion: "Región de la API de voz",
					temperature: "Temperatura",
					maxTokens: "Máximo de tokens",
					maxMessages: "Máximo de mensajes",
					helpText: "Este nodo permite integrar OpenAI a su flujo para crear respuestas dinámicas basadas en inteligencia artificial. Defina el estímulo adecuado para guiar el comportamiento del modelo."
				},
				typebot: {
					name: "Nombre de la integración",
					typebotUrl: "URL del Typebot",
					typebotUrlHelp: "URL completo de su Typebot (ej: https://bot.ejemplo.com)",
					typebotId: "ID de Typebot",
					typebotToken: "Token de Typebot",
					typebotTokenHelp: "Opcional. Utilizado para autenticación",
					saveResponse: "Guardar respuesta de Typebot",
					helpText: "Este nodo permite integrar un flujo de Typebot en su atención. Configure la URL y el ID correctos para dirigir al usuario al flujo adecuado."
				},
				queue: {
					transferTo: "Transferir a sector",
					selectQueue: "Seleccione el sector",
					queueRequired: "Sector es obligatorio",
					endFlow: "Finaliza el flujo",
					terminalDescription: "Cuando la atención se transfiere a un sector, el flujo se finaliza. El ticket quedará pendiente en el sector seleccionado.",
					helpText: "Nota: El nodo de sector transfiere la conversación a un sector específico. El flujo se finalizará y el ticket quedará pendiente en el sector seleccionado."
				},
				nodes: {
					start: "Inicio",
					end: "Fin",
					message: "Mensaje",
					conditional: "Condición",
					attendant: "Atendente",
					switchFlow: "Cambiar flujo",
					user: "Usuario",
					location: "Ubicación",
					outputs: "Este nodo tiene {{count}} salidas",
					openai: "OpenAI",
					typebot: "Typebot",
					queue: "Sector",
					webhook: "Webhook",
					image: "Imagen",
					question: "Pregunta",
					withVoice: "Con Voz",
					automatedFlow: "Flujo Automatizado",
					api: "Solicitud API",
					tag: {
						title: "Etiqueta",
						configuration: "Configuración de Etiquetas",
						selectTags: "Seleccionar Etiquetas",
						searchTags: "Buscar etiquetas",
						createTag: "Crear etiqueta",
						noTags: "Ninguna etiqueta encontrada",
						noTagsSelected: "Ninguna etiqueta seleccionada",
						noResults: "No se encontraron resultados",
						operation: "Operación",
						addOperation: "Agregar etiqueta",
						removeOperation: "Eliminar etiqueta",
						selectionMode: "Modo de selección",
						singleMode: "Única etiqueta",
						multipleMode: "Múltiples etiquetas",
						selectOne: "Seleccione una etiqueta",
						selectMultiple: "Seleccione una o más etiquetas",
						preview: "Visualización",
						willAdd: "Se añadirá al contacto:",
						willRemove: "Se eliminará del contacto:",
						helpText: "Este nodo permite agregar o eliminar etiquetas de los contactos. Las etiquetas son útiles para la segmentación y automatización de campañas."
					}
				},
				properties: {
					title: "Propiedades del Nodo",
					label: "Etiqueta",
					message: "Mensaje",
					messagePlaceholder: "Ingrese el mensaje a enviar...",
					messageType: "Tipo de mensaje",
					variable: "Variable",
					variablePlaceholder: "Nombre de la variable a evaluar",
					conditions: "Condiciones",
					conditionValue: "Valor de la condición",
					targetNode: "Nodo de destino",
					addCondition: "Agregar condición",
					unknownNodeType: "Tipo de nodo desconocido",
					buttons: "Botones",
					buttonText: "Texto del botón",
					buttonValue: "Valor del botón",
					addButton: "Agregar botón",
					mode: "Modo",
					flow: "Flujo",
					timeout: "Tiempo de espera",
					caption: "Leyenda",
					address: "Dirección",
					url: "URL",
					method: "Método",
					headers: "Encabezados",
					body: "Cuerpo de la Solicitud",
					responseVariable: "Variable de Respuesta",
					authType: "Tipo de Autenticación",
					maxMessages: "Máximo de mensajes",
					name: "Nombre",
					apiKey: "Clave API",
					prompt: "Prompt",
					voice: "Voz",
					temperature: "Temperatura",
					maxTokens: "Máximo de tokens",
					typebotUrl: "URL del Typebot",
					typebotId: "ID de Typebot",
					typebotToken: "Token de Typebot",
					saveResponse: "Guardar respuesta",
					types: {
						text: "Texto",
						image: "Imagen",
						audio: "Audio",
						video: "Video",
						file: "Arquivo",
						button: "Botones",
						list: "Lista"
					},
					mediaUrl: "URL del medio",
					mediaUrlPlaceholder: "Ingrese la URL del medio",
					listItems: "Elementos de la lista",
					listTitle: "Título de la lista",
					listButtonText: "Texto del botón de la lista",
					triggers: "Disparadores",
					triggersPlaceholder: "Palabras que inician el flujo (separadas por coma)",
					exclusive: "Exclusivo (impide otros flujos)"
				},
				controls: {
					zoomIn: "Ampliar",
					zoomOut: "Reducir",
					fitView: "Ajustar a la pantalla",
					undo: "Deshacer",
					redo: "Rehacer"
				},
				tooltips: {
					deleteNode: "Eliminar nodo",
					duplicateNode: "Duplicar nodo",
					connectNodes: "Conectar para definir el siguiente nodo"
				},
				messages: {
					deleteNode: "¿Estás seguro de que deseas eliminar este nodo?",
					connectionRemoved: "Conexión eliminada",
					connectionAdded: "Conexión añadida",
					nodeAdded: "Nodo añadido",
					nodeRemoved: "Nodo eliminado",
					invalidConnection: "Conexión inválida",
					maxConnectionsReached: "Se ha alcanzado el número máximo de conexiones",
					noContent: "Sin contenido",
					noImage: "Sin imagen",
					uploaded: "cargado",
					unsupportedType: "Tipo de mensaje no soportado",
					noConditions: "Ninguna condición definida"
				},
				messageTypes: {
					text: "Texto",
					image: "Imagen",
					audio: "Audio",
					video: "Video",
					document: "Documento",
					location: "Ubicación",
					unknown: "Tipo desconocido"
				},
				actions: {
					duplicate: "Duplicar",
					deleteEdge: "Eliminar conexión",
					edit: "Editar",
					delete: "Eliminar",
					transferVariables: "Transferir variables"
				},
				execution: {
					testMode: "Modo de prueba",
					startedAt: "Iniciado en",
					status: {
						active: "En ejecución",
						completed: "Completado",
						error: "Error",
						waitingInput: "Esperando respuesta"
					}
				},
				inputTypes: {
					text: "Texto",
					number: "Número",
					email: "Correo Electrónico",
					phone: "Teléfono",
					cpf: "CPF",
					cnpj: "CNPJ",
					media: "Medios",
					options: "Opciones",
					undefined: "Indefinido"
				},
				validationTypes: {
					none: "Sin validación",
					email: "Validación de correo electrónico",
					cpf: "Validación de CPF",
					cnpj: "Validación de CNPJ",
					regex: "Expresión Regular"
				},
				modes: {
					automatic: "Automático",
					manual: "Manual"
				},
				units: {
					seconds: "segundos"
				}
			},
			showTicketOpenModal: {
				title: {
					header: "Atención en curso"
				},
				form: {
					message: "Este contacto ya está siendo atendido",
					user: "Atendente",
					queue: "Sector",
					messageWait: "Espere, será transferido"
				},
				buttons: {
					close: "Cerrar"
				}
			},
			adminDashboard: {
				title: "Panel de control administrativo",
				loadingMessage: "Cargando datos del panel de control...",
				fetchError: "Error al cargar los datos. Por favor, inténtelo de nuevo.",
				updatingMessage: "Actualizando datos...",
				lastUpdate: "Última actualización: {{time}}",
				refreshTooltip: "Actualizar datos",
				timeRanges: {
					last7days: "Últimos 7 días",
					last30days: "Últimos 30 días",
					last90days: "Últimos 90 días"
				},
				tabs: {
					overview: "Visión General",
					financial: "Financiero",
					system: "Sistema"
				},
				metrics: {
					activeCompanies: "Empresas activas",
					total: "total",
					activeUsers: "Usuarios activos",
					lastMonth: "último mes",
					monthlyRevenue: "Ingresos mensuales",
					avgResponseTime: "Tiempo medio de respuesta",
					pending: "pendientes"
				},
				contactMap: {
					title: "Distribución geográfica",
					loading: "Cargando mapa...",
					totalContacts: "Total de contactos",
					noContacts: "Sin contactos",
					concentration: "Concentración",
					info: "Visualización de la distribución de contactos por estado"
				},
				qualityMetrics: {
					title: "Métricas de calidad",
					info: "Indicadores de calidad de la atención",
					fcr: {
						title: "Resolución en el primer contacto",
						subtitle: "Total resuelto: {{total}}",
						trend: "Tendencia FCR"
					},
					directResolution: {
						title: "Resolución directa",
						subtitle: "Total directo: {{total}}",
						trend: "Tendencia de resolución directa"
					},
					chartHelp: "El gráfico muestra la evolución de las métricas de calidad a lo largo del tiempo"
				},
				messaging: {
					title: "Métricas de mensajes",
					lastUpdate: "Última actualización",
					info: "Información sobre métricas de mensajes",
					totalMessages: "Total de Mensajes",
					sent: "Enviadas",
					received: "Recibidas",
					averageResponseTime: "Tiempo medio de respuesta",
					engagementRate: "Tasa de Participación",
					growth: "crecimiento",
					activeUsers: "Usuarios activos",
					avgMessagesPerUser: "Promedio de mensajes por usuario",
					peakHour: "Hora pico",
					messages: "mensajes",
					responseTime: "Tiempo de respuesta",
					failureRate: "Tasa de Fallo",
					disconnections: "Desconexiones Hoy"
				},
				whatsapp: {
					title: "Estado WhatsApp",
					info: "Monitoreo de conexiones WhatsApp",
					activeConnections: "Conexiones Activas",
					status: {
						connected: "Conectado",
						disconnected: "Desconectado",
						connecting: "Conectando"
					},
					deliveryRate: "Tasa de Entrega",
					messages: "Mensajes",
					responseTime: "Tiempo de Respuesta",
					failureRate: "Tasa de Fallo",
					disconnections: "Desconexiones"
				},
				performance: {
					title: "Rendimiento del Sistema",
					info: "Métricas de rendimiento y recursos",
					cpuUsage: "Uso de CPU",
					memoryUsage: "Uso de Memoria",
					networkUsage: "Uso de Red",
					cpuCores: "Núcleos CPU",
					totalMemory: "Memoria Total",
					statusChecks: "Verificaciones",
					services: {
						database: "Base de Datos",
						cache: "Caché",
						network: "Red"
					},
					alerts: "Alertas",
					healthy: "Sistema Saludable",
					issues: "Problemas Detectados",
					avgResponseTime: "Tiempo de Respuesta Promedio",
					requestsPerSecond: "Solicitudes/s",
					errorRate: "Tasa de Error",
					systemInfo: "Información del Sistema"
				},
				financialMetrics: {
					title: "Métricas Financieras",
					info: "Indicadores financieros y ingresos",
					monthlyRevenue: "Ingresos mensuales",
					revenue: "Ingresos",
					planDistribution: "Distribución por Plan",
					defaultRate: "Tasa de Incumplimiento",
					projection: "Proyección de Ingresos",
					projectedRevenue: "Ingresos Proyectados",
					actualRevenue: "Ingresos Reales"
				},
				engagementMetrics: {
					title: "Métricas de Participación",
					info: "Métricas de interacción y compromiso",
					messagesPerDay: "Mensajes/Día",
					campaignSuccess: "Éxito Campañas",
					activeContacts: "Contactos Activos",
					deliveryRate: "Tasa de Entrega"
				},
				campaignMetrics: {
					title: "Métricas de Campaña",
					successRate: "Tasa de Éxito",
					active: "Activas",
					completed: "Completadas",
					pending: "Pendientes",
					failed: "Fallos",
					sent: "Enviadas",
					delivered: "Entregadas",
					info: "Análisis de las campañas de mensajes",
					status: {
						active: "Campañas Activas",
						completed: "Campañas Concluidas",
						pending: "Campañas Pendientes",
						failed: "Campañas con Fallo"
					},
					totalContacts: "Total de contactos",
					deliveryRate: "Tasa de Entrega",
					engagementRate: "Tasa de Participación",
					performance: "Gráfico de Rendimiento",
					byType: "Distribución por Tipo"
				}
			},
			queueHelpModal: {
				title: "Ayuda - Opciones de Sector",
				helpButtonTooltip: "Abrir ayuda sobre opciones de sector",
				tabs: {
					overview: "Visión General",
					optionTypes: "Tipos de Opciones",
					advanced: "Recursos Avanzados",
					examples: "Ejemplos"
				},
				overview: {
					subtitle: "¿Qué son las Opciones de Sector?",
					description: "Las opciones de sector permiten crear flujos interactivos de atención automatizada. Con ellas, es posible configurar menús de atención, recopilar información de los clientes, aplicar validaciones, transferir conversaciones y mucho más.",
					commonUseCases: "Casos de uso comunes",
					useCase1: "Menú de Atención",
					useCase1Desc: "Cree menús interactivos para dirigir a los clientes al sector correcto",
					useCase2: "Transferencia Automática",
					useCase2Desc: "Transfiera conversaciones a colas, usuarios u otros números según sea necesario",
					useCase3: "Recolección de Datos",
					useCase3Desc: "Recopile y valide la información de los clientes antes de la atención humana",
					structureTitle: "Estructura de las Opciones",
					structureDesc: "Las opciones de sector están organizadas en una estructura jerárquica:",
					structure1: "Etapas",
					structure1Desc: "Cada nivel representa una etapa del flujo de atención",
					structure2: "Mensajes",
					structure2Desc: "Cada etapa puede contener un mensaje y opciones de respuesta",
					structure3: "Prueba y Visualización",
					structure3Desc: "Es posible probar el flujo usando el botón de reproducción"
				},
				optionTypes: {
					subtitle: "Tipos de Opciones Disponibles",
					description: "Hay varios tipos de opciones que se pueden utilizar para diferentes propósitos:",
					textDescription: "Envía un mensaje de texto simple al cliente.",
					textUseWhen: "Úsalo para mensajes informativos, solicitudes o instrucciones.",
					audioDescription: "Envía un archivo de audio al cliente.",
					audioUseWhen: "Use para mensagens de voz, instruções de áudio ou saudações personalizadas.",
					videoDescription: "Envía un archivo de vídeo al cliente.",
					videoUseWhen: "Use para tutoriais, demonstrações de produtos ou apresentações.",
					imageDescription: "Envía una imagen al cliente.",
					imageUseWhen: "Use para mostrar produtos, catálogos, instruções visuais ou qualquer conteúdo gráfico.",
					documentDescription: "Envía un documento al cliente (PDF, DOCX, etc).",
					documentUseWhen: "Use para enviar manuais, contratos, formulários ou qualquer documento formal.",
					contactDescription: "Envía una tarjeta de contacto al cliente.",
					contactUseWhen: "Use para compartilhar contatos importantes, como suporte técnico, vendas ou outros departamentos.",
					transferTitle: "Opciones de Transferencia",
					transferDescription: "Permiten transferir la conversación a diferentes destinos:",
					transferQueueDesc: "Transfiere la conversación a otro sector de atención",
					transferUserDesc: "Transfiere la conversación a un agente específico",
					transferWhatsappDesc: "Transfiere la conversación a otro número de WhatsApp de tu cuenta",
					transferUseWhen: "Úsalo cuando necesites dirigir al cliente al sector o agente más adecuado.",
					validationDescription: "Valida la información proporcionada por el cliente según reglas predefinidas.",
					validationUseWhen: "Úsalo para recopilar y validar datos como CPF, correo electrónico, teléfono o información personalizada.",
					validationCPFDesc: "Valida si el formato del CPF es correcto y si es un CPF válido",
					validationEmailDesc: "Valida si el formato del correo electrónico es correcto",
					validationPhoneTitle: "Teléfono",
					validationPhoneDesc: "Valida si el formato del número de teléfono es correcto",
					validationCustomTitle: "Personalizado",
					validationCustomDesc: "Permite crear validaciones personalizadas usando expresiones regulares (regex)",
					conditionalDescription: "Analiza la respuesta del cliente y dirige a diferentes opciones según condiciones.",
					conditionalUseWhen: "Úsalo para crear flujos dinámicos que se adaptan a las respuestas de los clientes.",
					conditionalOperators: "Operadores disponibles",
					operatorEqualsDesc: "Verifica si la respuesta es exactamente igual al valor especificado",
					operatorContainsDesc: "Verifica si la respuesta contiene el valor especificado",
					operatorStartsWithDesc: "Verifica si la respuesta comienza con el valor especificado",
					operatorEndsWithDesc: "Verifica si la respuesta termina con el valor especificado",
					operatorRegexDesc: "Verifica si la respuesta corresponde al patrón regex especificado"
				},
				advanced: {
					subtitle: "Recursos Avanzados",
					description: "Explore recursos avanzados para crear flujos de atención más sofisticados:",
					nestingTitle: "Estructura Anidada",
					nestingDesc: "Es posible crear estructuras anidadas para organizar el flujo de atención en niveles jerárquicos.",
					nestingExample: "Ejemplo de estructura anidada",
					variablesTitle: "Variables en el Mensaje",
					variablesDesc: "Usa variables para personalizar los mensajes con información del contacto, del sector o de la empresa.",
					variablesExample: "Ejemplo de uso de variables",
					variablesSample: "¡Hola {{contact.name}}, bienvenido a {{queue.name}}!",
					flowControlTitle: "Control de Flujo",
					flowControlDesc: "Combina opciones condicionales y validaciones para crear flujos de atención dinámicos.",
					conditionalExample: "Ejemplo de flujo condicional",
					conditionalStep1: "Configura una pregunta inicial (ej: '¿Cómo puedo ayudarte?')",
					conditionalStep2: "Agrega una opción del tipo 'condicional'",
					conditionalStep3: "Configura condiciones basadas en palabras clave (ej: 'soporte', 'compra')",
					conditionalStep4: "Define destinos diferentes para cada condición",
					previewTitle: "Visualización y Prueba",
					previewDesc: "Usa la función de visualización para probar cómo aparecerán los mensajes para el cliente.",
					previewSteps: "Cómo usar la función de visualización"
				},
				examples: {
					subtitle: "Ejemplos Prácticos",
					description: "Mira ejemplos de configuraciones comunes para inspirar tus flujos de atención:",
					menuTitle: "Menú de Atención",
					menuDescription: "Un menú básico de atención que dirige al cliente a diferentes sectores.",
					menuExample: "Ejemplo de menú",
					menuText: "Bem-vindo ao nosso atendimento! 👋\n\nSelecione uma opção digitando o número correspondente:\n\n1️⃣ Suporte Técnico\n2️⃣ Financeiro\n3️⃣ Vendas\n\nOu digite 'atendente' para falar com um de nossos colaboradores.",
					menuStep1: "Configurar el mensaje de bienvenida con las opciones",
					menuStep2: "Configurar mensaje específico de soporte técnico",
					menuStep3: "Configurar transferencia al sector financiero",
					menuStep4: "Configurar transferencia a un agente de ventas",
					formTitle: "Recolección de Datos",
					formDescription: "Un formulario para recopilar y validar información del cliente antes de la atención.",
					formExample: "Ejemplo de recopilación de datos",
					formText: "Para continuar con su atención, necesitamos algunos datos:\n\nPor favor, indique su nombre completo:",
					formStep1: "Configurar el mensaje inicial solicitando datos",
					formStep2: "Configurar validación para el nombre (no vacío)",
					formStep3: "Configurar validación de correo electrónico",
					formStep4: "Configurar validación de CPF",
					formStep5: "Configurar mensaje de conclusión y transferencia",
					conditionalTitle: "Atención Condicional",
					conditionalDescription: "Un flujo que dirige al cliente basado en palabras clave en la respuesta.",
					conditionalExample: "Ejemplo de flujo condicional",
					conditionalText: "¿Cómo puedo ayudarte hoy? Por favor, describe brevemente tu necesidad.",
					conditionalStep1: "Configurar la pregunta inicial",
					conditionalStep2: "Configurar el análisis condicional de la respuesta",
					conditionalCondition1: "Si contiene 'problema' o 'no funciona'",
					conditionalTarget1: "Dirigir a la opción de Soporte Técnico",
					conditionalCondition2: "Si contiene 'comprar' o 'precio'",
					conditionalTarget2: "Dirigir a la opción de Ventas",
					conditionalDefault: "Opción por defecto para otras respuestas",
					conditionalTarget3: "Dirigir a Atención General",
					implementation: "Implementación"
				},
				common: {
					useWhen: "Cuándo usar",
					availableTypes: "Tipos disponibles"
				}
			},
			groups: {
				title: "Grupos",
				createNewGroup: "Crear Nuevo Grupo",
				joinGroup: "Entrar en un Grupo",
				groupInfo: "Información del Grupo",
				groupDeleted: "Grupo eliminado con éxito",
				createSuccess: "Grupo creado con éxito",
				updateSuccess: "Grupo actualizado con éxito",
				deleteConfirmTitle: "Confirmar eliminación",
				deleteConfirmMessage: "¿Estás seguro de que deseas eliminar el grupo {name}?",
				groupName: "Nombre del Grupo",
				groupNamePlaceholder: "Ingresa el nombre del grupo",
				description: "Descripción",
				settings: "Configuraciones",
				onlyAdminsMessage: "Solo los administradores pueden enviar mensajes",
				onlyAdminsSettings: "Solo los administradores pueden cambiar la configuración",
				forceDelete: "Eliminar Forzadamente",
				forceDeleteConfirmTitle: "Confirmar Eliminación Forzada",
				forceDeleteConfirmMessage: "¿Estás seguro de que deseas eliminar forzadamente el grupo \"{name}\"?",
				forceDeleteWarning: "ATENCIÓN: Esta acción eliminará el grupo solo del sistema, ignorando errores de comunicación con WhatsApp. Úsalo solo cuando el grupo ya haya sido eliminado en WhatsApp y aún aparezca en el sistema.",
				groupForceDeleted: "Grupo eliminado forzadamente con éxito.",
				extractContacts: "Extraer Contactos del Grupo",
				extractContactsDescription: "Ingrese el enlace de invitación de un grupo de WhatsApp para extraer la lista de contactos.",
				groupInviteLink: "Enlace de Invitación del Grupo",
				downloadExcel: "Descargar Lista de Contactos",
				copyDownloadLink: "Copiar Enlace de Descarga",
				extractContactsInfo: "Este recurso permite extrair contatos de grupos públicos. O sistema entrará no grupo, extrairá os contatos e gerará um arquivo Excel que você pode baixar.",
				importContacts: "Importar Contactos al Grupo",
				importContactsDescription: "Seleccione un grupo y envíe un archivo CSV o Excel que contenga los números de teléfono que desea agregar.",
				selectGroup: "Seleccionar Grupo",
				selectGroupHelp: "Elija el grupo al que desea importar contactos.",
				selectFile: "Seleccionar Archivo",
				fileFormatInfo: "El archivo debe contener una columna llamada 'numero' con los números de teléfono en formato internacional, sin caracteres especiales (ej: 5511999999999).",
				downloadTemplate: "Descargar Modelo de Archivo",
				template: "Modelo",
				importSuccess: "Importación completada: {valid} contacto(s) válido(s) importado(s), {invalid} número(s) inválido(s).",
				invalidNumbers: "Números inválidos",
				importTips: "Consejos de importación",
				importTip1: "Utilice números en formato internacional (Ej: 5511999999999).",
				importTip2: "Verifique que los números sean válidos y estén activos en WhatsApp.",
				importTip3: "Evite incluir muchos números de una sola vez para evitar el bloqueo por spam.",
				tabs: {
					info: "Informaciones",
					participants: "Participantes",
					inviteLink: "Enlace de Invitación",
					list: "Lista",
					invites: "Invitaciones",
					requests: "Solicitudes",
					extract: "Extrair Contatos",
					import: "Importar Contactos"
				},
				addParticipants: "Agregar Participantes",
				addNewParticipants: "Agregar Nuevos Participantes",
				searchContacts: "Buscar contactos...",
				selectedParticipants: "Participantes Seleccionados",
				noParticipantsSelected: "Ningún participante seleccionado",
				searchParticipants: "Buscar participantes...",
				selectContacts: "Seleccionar contactos",
				participantsAdded: "Participantes agregados con éxito",
				noParticipantsFound: "Ningún participante encontrado",
				tryAnotherSearch: "Intente otra búsqueda o limpie el campo de búsqueda",
				admin: "Administrador",
				promoteToAdmin: "Promover a Administrador",
				demoteFromAdmin: "Eliminar Privilegios de Administrador",
				removeParticipant: "Eliminar Participante",
				participantPromoted: "Participante promovido a administrador",
				participantDemoted: "Privilegios de administrador eliminados",
				participantRemoved: "Participante eliminado del grupo",
				inviteLink: "Enlace de Invitación",
				inviteLinkDescription: "Comparte este enlace para invitar personas al grupo. Cualquier persona con el enlace puede unirse al grupo.",
				generateInviteLink: "Generar Enlace de Invitación",
				copyLink: "Copiar Enlace",
				revokeAndGenerate: "Revocar y Generar Nuevo",
				inviteCodeRevoked: "Enlace de invitación revocado y nuevo enlace generado",
				linkCopied: "Enlace copiado al portapapeles",
				pendingRequests: "Solicitudes Pendientes",
				noRequests: "Ninguna solicitud pendiente",
				requestsDescription: "Cuando se reciban nuevas solicitudes, aparecerán aquí.",
				requestedAt: "Solicitado en",
				approve: "Aprobar",
				reject: "Rechazar",
				participantApproved: "Participante aprobado",
				participantRejected: "Participante rechazado",
				requestsInfo: "Solo las solicitudes de entrada en grupos con aprobación aparecen aquí.",
				selectGroupToSeeRequests: "Seleccione un grupo de la lista para ver las solicitudes pendientes",
				searchPlaceholder: "Buscar grupos...",
				newGroup: "Nuevo Grupo",
				noGroupsFound: "Ningún grupo encontrado",
				createGroupsMessage: "Cree un nuevo grupo o únase a un grupo existente",
				table: {
					name: "Nombre",
					participants: "Participantes",
					createdAt: "Creado en",
					actions: "Acciones",
					rowsPerPage: "Líneas por página",
					of: "de"
				},
				actions: {
					edit: "Informaciones",
					requests: "Solicitudes",
					delete: "Eliminar",
					forceDelete: "Exclusão Forçada"
				},
				joinByInvite: "Ingresar con Código de Invitación",
				joinByInviteDescription: "Para unirse a un grupo, necesitas el código de invitación. Pega el código o enlace de invitación a continuación.",
				joinGroupDescription: "Para unirse a un grupo, necesitas el código de invitación. Pega el código o enlace de invitación a continuación.",
				inviteCode: "Código o Enlace de Invitación",
				check: "Verificar",
				joining: "Ingresando...",
				join: "Iniciar sesión",
				groupInfoFound: "¡Información del grupo encontrada! Verifica los detalles a continuación antes de unirte.",
				createdBy: "Creado por",
				participants: "Participantes",
				unknown: "Desconocido",
				joinSuccess: "Ingresaste al grupo con éxito",
				profilePicSuccess: "Foto de perfil actualizada con éxito",
				profilePicRemoved: "Foto de perfil eliminada con éxito",
				clickToChangePhoto: "Haz clic para cambiar la foto",
				clickToAddPhoto: "Haz clic para agregar una foto",
				removeProfilePicConfirm: "Eliminar foto de perfil",
				removeProfilePicMessage: "¿Estás seguro de que deseas eliminar la foto de perfil de este grupo?",
				addGroupPhoto: "Agregar foto de grupo",
				groupPhotoSelected: "Foto seleccionada (haga clic para cambiar)",
				profilePicUploadError: "Error al subir la imagen",
				errors: {
					titleRequired: "El nombre del grupo es obligatorio",
					participantsRequired: "Agregue al menos un participante",
					inviteCodeRequired: "El código de invitación es obligatorio",
					invalidInviteCode: "Código de invitación inválido",
					inviteCodeFailed: "Error al obtener el código de invitación",
					selectParticipants: "Seleccione al menos un participante para agregar",
					linkRequired: "El enlace de invitación es obligatorio",
					extractFailed: "Error al extraer contactos. Inténtalo de nuevo más tarde.",
					selectGroup: "Seleccione un grupo",
					selectFile: "Seleccione un archivo",
					invalidFileFormat: "Formato de archivo inválido. Utilice CSV, XLSX o XLS.",
					importFailed: "Error al importar contactos. Verifique el formato del archivo e inténtelo de nuevo."
				}
			},
			employers: {
				title: "Gestión de Empresas",
				searchPlaceholder: "Buscar empresas...",
				noEmployers: "No se encontraron empresas",
				buttons: {
					add: "Agregar Empresa",
					edit: "Editar",
					delete: "Eliminar",
					cancel: "Cancelar",
					update: "Actualizar",
					create: "Crear",
					refresh: "Actualizar lista",
					filter: "Filtrar"
				},
				table: {
					name: "Nombre",
					positions: "Cargos",
					createdAt: "Fecha de Creación",
					status: "Estado",
					actions: "Acciones",
					rowsPerPage: "Líneas por página",
					positionsLabel: "cargos"
				},
				status: {
					active: "Activo",
					inactive: "Inactivo"
				},
				modal: {
					add: "Agregar Nueva Empresa",
					edit: "Editar Empresa"
				},
				form: {
					name: "Nombre de la Empresa",
					nameRequired: "Nombre es obligatorio"
				},
				confirmModal: {
					deleteTitle: "Confirmar Eliminación",
					deleteMessage: "¿Estás seguro de que deseas eliminar esta empresa?"
				},
				notifications: {
					created: "Empresa creada con éxito",
					updated: "Empresa actualizada con éxito",
					deleted: "Empresa eliminada con éxito",
					fetchError: "Error al cargar empresas",
					saveError: "Error al guardar la empresa",
					deleteError: "Error al eliminar empresa",
					nameRequired: "El nombre de la empresa es obligatorio"
				},
				stats: {
					total: "Total de Empresas",
					active: "Empresas activas",
					recentlyAdded: "Agregadas Recientemente"
				}
			},
			positions: {
				title: "Gestión de Cargos",
				searchPlaceholder: "Buscar cargos...",
				noDataFound: "Ups, no hay nada por aquí.",
				buttons: {
					add: "Agregar Cargo",
					edit: "Editar",
					delete: "Eliminar",
					cancel: "Cancelar",
					update: "Actualizar",
					create: "Crear",
					refresh: "Actualizar lista",
					filter: "Filtrar"
				},
				table: {
					name: "Nombre",
					employers: "Empresas",
					createdAt: "Fecha de Creación",
					status: "Estado",
					actions: "Acciones",
					rowsPerPage: "Líneas por página"
				},
				status: {
					active: "Activo",
					inactive: "Inactivo"
				},
				modal: {
					add: "Agregar Nuevo Cargo",
					edit: "Editar Cargo",
					employersLabel: "Empresas",
					employersPlaceholder: "Seleccione las empresas"
				},
				form: {
					name: "Nombre del Cargo",
					nameRequired: "Nombre es obligatorio"
				},
				confirmModal: {
					deleteTitle: "Confirmar Eliminación",
					deleteMessage: "¿Estás seguro de que deseas eliminar este cargo?"
				},
				notifications: {
					created: "Cargo creado con éxito",
					updated: "Cargo actualizado con éxito",
					deleted: "Cargo eliminado con éxito",
					fetchError: "Error al cargar cargos",
					saveError: "Error al guardar el cargo",
					deleteError: "Error al eliminar el cargo",
					nameRequired: "El nombre del cargo es obligatorio"
				},
				stats: {
					total: "Total de Cargos",
					active: "Cargos Activos",
					recentlyAdded: "Agregados Recientemente"
				}
			},
			buttons: {
				save: "Guardar",
				cancel: "Cancelar",
				close: "Cerrar",
				delete: "Eliminar",
				edit: "Editar",
				add: "Agregar",
				update: "Actualizar",
				download: "Descargar archivo",
				confirm: "Confirmar",
				export: "Exportar",
				print: "Imprimir",
				saving: "Guardando...",
				filter: "Filtrar",
				clear: "Limpiar",
				clearFilters: "Limpiar Filtros",
				applyFilters: "Aplicar filtros",
				finish: "Concluir",
				next: "Siguiente",
				back: "Volver",
				processing: "Procesando..."
			},
			dateTime: {
				today: "Hoy",
				clear: "Limpiar",
				ok: "OK",
				invalidDate: "Formato de fecha inválido",
				maxDate: "La fecha no puede ser posterior a la máxima",
				minDate: "La fecha no puede ser anterior a la mínima"
			},
			taskReports: {
				title: "Informes de Tareas",
				subtitle: "Visión general del rendimiento y estadísticas de las tareas",
				all: "Todos",
				summary: {
					total: "Total de Tareas",
					completed: "Tareas completadas",
					pending: "Tareas pendientes",
					overdue: "Tareas atrasadas",
					inProgress: "En Progreso"
				},
				filters: {
					title: "Filtros",
					startDate: "Fecha Inicial",
					endDate: "Fecha Final",
					user: "Usuario",
					status: "Estado",
					group: "Grupo",
					all: "Todos",
					clearFilters: "Limpiar Filtros"
				},
				status: {
					title: "Estado",
					completed: "Completada",
					pending: "Pendiente",
					overdue: "Atrasada",
					inProgress: "En Progreso",
					assigned: "Asignadas"
				},
				weeklyProgress: {
					title: "Progreso Semanal",
					subtitle: "Tareas completadas por día",
					noData: "No hay datos disponibles para el período seleccionado"
				},
				userPerformance: {
					title: "Rendimiento por Usuario",
					subtitle: "Comparativa de tareas por usuario",
					assigned: "Asignadas",
					completed: "Completadas",
					overdue: "Atrasadas",
					noData: "No se encontraron usuarios"
				},
				statusDistribution: {
					title: "Distribución por Estado",
					subtitle: "Visión general de las tareas por estado",
					noData: "No se encontraron tareas"
				},
				attachments: {
					title: "Adjuntos y Notas",
					subtitle: "Estadísticas de adjuntos y notas",
					withAttachments: "Con Adjuntos",
					withNotes: "Con notas",
					fileTypes: "Tipos de archivos",
					noData: "No se encontraron adjuntos"
				},
				export: {
					title: "Exportar informe",
					pdf: "Exportar como PDF",
					excel: "Exportar como Excel",
					success: "Informe exportado con éxito",
					error: "Error al exportar informe"
				},
				errors: {
					loadError: "Error al cargar los datos",
					retryButton: "Intentar de nuevo",
					invalidDateRange: "Período inválido",
					generic: "Se produjo un error. Inténtalo de nuevo más tarde."
				},
				tooltips: {
					refresh: "Actualizar datos",
					export: "Exportar informe",
					filter: "Aplicar filtros",
					clearFilters: "Limpiar filtros"
				},
				noData: {
					title: "No hay datos para mostrar",
					message: "Intente ajustar los filtros o crear algunas tareas"
				}
			},
			asaas: {
				title: "Integración Asaas",
				subtitle: "Configure su integración con Asaas para el envío automático de facturas",
				configuration: "Configuración",
				credentials: "Credenciales",
				rules: "Reglas de envío",
				preview: "Vista previa",
				success: {
					saveSettings: "Configuraciones guardadas con éxito"
				},
				stats: {
					title: "Estadísticas Asaas",
					totalCompanies: "Total de Empresas",
					pendingCompanies: "Empresas con facturas pendientes",
					overdueCompanies: "Empresas con facturas vencidas",
					lastUpdate: "Última actualización"
				},
				steps: {
					credentials: "Credenciales",
					connection: "Conexión",
					rules: "Reglas",
					review: "Revisión"
				},
				stepHelper: {
					credentials: "Configure sus credenciales de Asaas",
					connection: "Seleccione la conexión de WhatsApp",
					rules: "Configure las reglas de envío",
					review: "Revise su configuración"
				},
				token: "Token de Asaas",
				tokenRequired: "Token es obligatorio",
				tokenHelper: "Token de acceso encontrado en el panel de Asaas",
				validatingToken: "Validando token...",
				tokenConfigured: "Token configurado",
				whatsapp: "Conexión WhatsApp",
				whatsappRequired: "La conexión de WhatsApp es obligatoria",
				whatsappHelper: "Seleccione qué conexión se utilizará para el envío",
				whatsappSelected: "WhatsApp seleccionado",
				rule: "Regla",
				rulesCount: "Total de reglas",
				addRule: "Agregar Regla",
				editRule: "Editar Regla",
				deleteRule: "Eliminar Regla",
				ruleTitle: "Regla de Envío",
				daysBeforeDue: "Días antes del vencimiento",
				days: "días",
				message: "Mensaje",
				messageHelper: "Utilice las variables disponibles para personalizar su mensaje",
				availableVariables: "Variables disponibles",
				variables: {
					name: "Nombre del cliente",
					value: "Valor del cobro",
					dueDate: "Fecha de vencimiento",
					paymentLink: "Enlace de pago"
				},
				defaultMessage: "Hola {name}, tienes una factura por un valor de {value} que vence el {dueDate}.",
				sendBoleto: "Enviar Boleto/PIX",
				sendBoletoHelp: "Envía código QR del PIX y código para copiar y pegar",
				qrCodeMessage: "Aquí está el código QR para el pago a través de PIX:",
				pixCodeMessage: "Código PIX para copiar y pegar:",
				paymentOptions: "Opciones de Pago",
				executionTime: "Horario de ejecución",
				messageInterval: "Intervalo entre mensajes",
				messageIntervalHelper: "Intervalo en minutos entre el envío de cada mensaje",
				weekdays: {
					monday: "Lunes",
					tuesday: "Martes",
					wednesday: "Miércoles",
					thursday: "Jueves",
					friday: "Viernes",
					saturday: "Sábado",
					sunday: "Domingo"
				},
				viewMode: "Modo de visualización",
				listView: "Lista",
				gridView: "Cuadrícula",
				previewTitle: "Vista Previa del Mensaje",
				messagePreview: "Vista previa del mensaje",
				previewBoletoMessage: "El boleto/código QR se adjuntará automáticamente",
				optional: "Opcional",
				save: "Guardar",
				saving: "Guardando...",
				cancel: "Cancelar",
				next: "Siguiente",
				back: "Volver",
				finish: "Concluir",
				runNow: "Ejecutar Ahora",
				processStarted: "Procesamiento iniciado",
				processing: "Procesando...",
				readyToSave: "Configuración lista para ser guardada",
				configurationSummary: "Resumen de la configuración",
				configured: "Configurado",
				notConfigured: "No Configurado",
				savedSuccess: "Configuraciones guardadas con éxito",
				deleteSuccess: "Regla eliminada con éxito",
				deleteConfirm: "¿Estás seguro de que deseas eliminar esta regla?",
				errors: {
					fetchStats: "Error al buscar estadísticas de Asaas",
					invalidDays: "Número de días inválido",
					messageRequired: "El mensaje es obligatorio",
					invalidToken: "Token inválido",
					errorSaving: "Error al guardar configuraciones",
					errorLoading: "Error al cargar configuraciones",
					errorConnection: "Error al probar la conexión",
					loadSettings: "Error al cargar configuraciones",
					saveSettings: "Error al guardar configuraciones",
					runProcess: "Error al ejecutar procesamiento",
					preview: "Error al cargar vista previa"
				},
				noRules: "Ninguna regla configurada",
				tooltips: {
					addRule: "Agregar nueva regla de envío",
					deleteRule: "Eliminar esta regla",
					editRule: "Editar esta regla",
					preview: "Ver vista previa del mensaje",
					sendBoleto: "Habilitar envío de boleto/PIX",
					runNow: "Ejecutar procesamiento ahora",
					settings: "Configuraciones de la integración",
					showVariables: "Mostrar variables disponibles"
				},
				status: {
					success: "Éxito",
					error: "Error",
					warning: "Atención",
					info: "Información"
				},
				delete: "Eliminar",
				edit: "Editar",
				add: "Agregar",
				settings: {
					success: "Configuraciones guardadas con éxito",
					error: "Error al guardar configuraciones",
					save: "Guardar Configuraciones"
				}
			},
			whatsappTemplates: {
				title: "Plantillas de WhatsApp",
				fetchError: "Error al buscar plantillas",
				deleteSuccess: "Plantilla eliminada con éxito",
				deleteError: "Error al eliminar plantilla",
				createSuccess: "Plantilla creada con éxito",
				updateSuccess: "Plantilla actualizada con éxito",
				submitError: "Error al guardar plantilla",
				deleteTitle: "Eliminar Plantilla",
				deleteMessage: "¿Estás seguro de que deseas eliminar esta plantilla?",
				table: {
					name: "Nombre",
					status: "Estado",
					language: "Idioma",
					category: "Categoría",
					actions: "Acciones"
				},
				buttons: {
					add: "Nueva Plantilla",
					edit: "Editar",
					delete: "Eliminar",
					view: "Visualizar",
					cancel: "Cancelar"
				},
				modal: {
					addTitle: "Nueva Plantilla",
					editTitle: "Editar Plantilla",
					viewTitle: "Ver Plantilla"
				},
				form: {
					name: "Nombre de la Plantilla",
					language: "Idioma",
					category: "Categoría",
					header: "Encabezado",
					body: "Cuerpo del Mensaje",
					bodyHelp: "Usa {{1}}, {{2}}, etc para variables dinámicas",
					footer: "Pie de Página",
					buttons: "Botones",
					addButton: "Agregar Botón",
					buttonType: "Tipo de Botón",
					buttonText: "Texto del Botón"
				},
				preview: {
					title: "Vista Previa de la Plantilla"
				}
			},
			campaigns: {
				title: "Campañas",
				searchPlaceholder: "Buscar campañas...",
				empty: {
					title: "No se encontraron campañas",
					message: "Todavía no tienes campañas registradas. Crea una nueva campaña para comenzar tus envíos masivos.",
					button: "Crear Campaña"
				},
				buttons: {
					add: "Nueva Campaña",
					edit: "Editar",
					delete: "Eliminar",
					report: "Informe",
					stop: "Detener",
					restart: "Reiniciar",
					upload: "Subir Archivo"
				},
				tabs: {
					campaigns: "Campañas",
					contactLists: "Listas de Contactos",
					reports: "Informes",
					settings: "Configuraciones",
					files: "Archivos"
				},
				table: {
					name: "Nombre",
					status: "Estado",
					contactList: "Lista de Contactos",
					whatsapp: "WhatsApp",
					scheduledAt: "Programación",
					confirmation: "Confirmación",
					actions: "Acciones",
					enabled: "Activado",
					disabled: "Desactivado",
					noList: "Sin lista",
					noWhatsapp: "No definido",
					noSchedule: "No agendado",
					rowsPerPage: "Elementos por página",
					of: "de"
				},
				status: {
					inactive: "Inactiva",
					scheduled: "Agendada",
					inProgress: "En Progreso",
					cancelled: "Cancelada",
					finished: "Finalizada",
					unknown: "Desconocido"
				},
				dialog: {
					new: "Nueva Campaña",
					update: "Editar Campaña",
					readonly: "Ver Campaña",
					form: {
						name: "Nombre de la Campaña",
						confirmation: "Confirmación de Lectura",
						contactList: "Lista de Contactos",
						tagList: "Etiqueta",
						whatsapp: "Conexión WhatsApp",
						scheduledAt: "Programación",
						fileList: "Lista de Archivos",
						none: "Ninguno",
						disabled: "Desactivado",
						enabled: "Activado",
						message1: "Mensagem 1",
						message2: "Mensagem 2",
						message3: "Mensagem 3",
						message4: "Mensagem 4",
						message5: "Mensagem 5",
						confirmationMessage1: "Mensagem de confirmação 1",
						confirmationMessage2: "Mensagem de confirmação 2",
						confirmationMessage3: "Mensagem de confirmação 3",
						confirmationMessage4: "Mensagem de confirmação 4",
						confirmationMessage5: "Mensagem de confirmação 5",
						messagePlaceholder: "Escribe tu mensaje...",
						confirmationPlaceholder: "Ingresa el mensaje de confirmación...",
						messageHelp: "Usa {nombre} para insertar el nombre del contacto, {número} para el número",
						confirmationHelp: "Mensaje enviado cuando el contacto confirme la recepción"
					},
					tabs: {
						message1: "Mensagem 1",
						message2: "Mensagem 2",
						message3: "Mensagem 3",
						message4: "Mensagem 4",
						message5: "Mensagem 5"
					},
					buttons: {
						add: "Agregar",
						edit: "Guardar Cambios",
						cancel: "Cancelar",
						close: "Cerrar",
						restart: "Reiniciar",
						attach: "Adjuntar Archivo"
					}
				},
				confirmationModal: {
					deleteTitle: "Eliminar campaña",
					deleteMessage: "Esta acción no se puede deshacer y se perderán todos los datos relacionados con esta campaña.",
					deleteMediaTitle: "Eliminar adjunto",
					cancelConfirmTitle: "Cancelar campaña",
					cancelConfirmMessage: "¿Estás seguro de que deseas cancelar esta campaña? Esta acción no se puede deshacer.",
					restartConfirmTitle: "Reiniciar campaña",
					restartConfirmMessage: "¿Estás seguro de que deseas reiniciar esta campaña? Esto enviará mensajes nuevamente a todos los contactos."
				},
				toasts: {
					success: "¡Campaña guardada exitosamente!",
					deleted: "¡Campaña eliminada exitosamente!",
					cancel: "¡Campaña cancelada exitosamente!",
					restart: "¡Campaña reiniciada exitosamente!",
					fetchError: "Error al buscar campañas.",
					saveError: "Error al guardar campaña.",
					deleteError: "Error al eliminar campaña.",
					cancelError: "Error al cancelar campaña.",
					restartError: "Error al reiniciar campaña.",
					campaignFetchError: "Error al cargar datos de la campaña.",
					contactListsFetchError: "Error al cargar listas de contactos.",
					whatsappsFetchError: "Error al cargar conexiones de WhatsApp.",
					filesFetchError: "Error al cargar listas de archivos.",
					mediaDeleted: "¡Anexo removido exitosamente!",
					mediaDeleteError: "Error al remover anexo.",
					mediaError: "Error al subir el anexo, pero la campaña fue guardada."
				},
				validation: {
					nameRequired: "El nombre es obligatorio",
					nameMin: "El nombre debe tener al menos 2 caracteres",
					nameMax: "El nombre debe tener como máximo 50 caracteres",
					whatsappRequired: "La conexión de WhatsApp es obligatoria",
					contactsRequired: "Seleccione una lista de contactos o una etiqueta",
					messageRequired: "Complete al menos un mensaje"
				},
				warning: {
					title: "¡Atención!",
					contactLimit: {
						title: "Límite de Contactos:",
						description: "Recomendamos no exceder los 200 contactos por campaña para evitar bloqueos en WhatsApp."
					},
					interval: {
						title: "Intervalo Entre Mensajes:",
						description: "Configure intervalos adecuados entre los mensajes para evitar bloqueos en WhatsApp."
					},
					observation: {
						title: "Observación:",
						description: "Use las campañas con responsabilidad. Los envíos abusivos pueden resultar en el bloqueo de su cuenta de WhatsApp."
					}
				},
				reports: {
					title: "Informes de Campañas",
					selectCampaign: "Seleccione una campaña",
					selectToView: "Seleccione una campaña para ver los informes",
					filters: {
						today: "Hoy",
						week: "Última semana",
						month: "Último mes",
						quarter: "Últimos 3 meses"
					},
					stats: {
						total: "Total de Mensajes",
						delivered: "Entregadas",
						read: "Leídas",
						replied: "Respondidas"
					},
					charts: {
						title: "Análisis de Rendimiento",
						statusDistribution: "Distribución por Estado",
						dailyProgress: "Progreso Diario",
						messages: "Mensajes",
						delivered: "Entregadas",
						read: "Leídas",
						replied: "Respondidas"
					},
					details: {
						title: "Detalles de la Campaña",
						startedAt: "Iniciada en",
						completedAt: "Concluida en",
						status: "Estado",
						confirmation: "Confirmación",
						notStarted: "No iniciada",
						notCompleted: "No concluida"
					},
					noData: {
						title: "No hay datos para mostrar",
						message: "No hay información disponible para esta campaña aún."
					},
					noChartData: "Sin datos disponibles para este gráfico",
					empty: {
						title: "Ningún informe disponible",
						message: "Necesita tener campañas registradas para ver informes.",
						button: "Crear Campaña"
					},
					chartType: "Tipo de Gráfico",
					chartTypes: {
						line: "Línea",
						bar: "Barra",
						pie: "Pastel"
					},
					errors: {
						title: "Error al cargar informe",
						fetchCampaigns: "Error al buscar campañas.",
						fetchReportData: "Erro ao carregar dados do relatório."
					},
					status: {
						pending: "Pendiente",
						delivered: "Entregado",
						read: "Leída",
						replied: "Respondida",
						error: "Error",
						rejected: "Rechazada",
						canceled: "Cancelada"
					}
				}
			},
			contactListsValidation: {
				nameRequired: "Nombre es obligatorio",
				nameMin: "El nombre debe tener al menos 2 caracteres",
				nameMax: "El nombre debe tener como máximo 50 caracteres"
			},
			contactListItems: {
				validation: {
					nameRequired: "El nombre es obligatorio",
					nameMin: "El nombre debe tener al menos 2 caracteres",
					nameMax: "El nombre debe tener como máximo 50 caracteres",
					numberRequired: "El número es obligatorio",
					numberMin: "El número debe tener al menos 8 caracteres",
					numberMax: "O número deve ter no máximo 50 caracteres",
					emailInvalid: "Correo electrónico inválido"
				},
				modal: {
					addTitle: "Agregar Contacto",
					editTitle: "Editar Contacto",
					mainInfo: "Informaciones Principales",
					name: "Nombre",
					number: "Número",
					email: "Correo Electrónico",
					numberHelp: "Formato: DDI + DDD + Número (Ej: 5513912344321)",
					cancel: "Cancelar",
					add: "Agregar",
					saveChanges: "Guardar Cambios"
				},
				confirmationModal: {
					deleteTitle: "Eliminar contacto",
					deleteMessage: "Esta acción no se puede deshacer. El contacto será eliminado permanentemente de la lista."
				},
				importDialog: {
					title: "Importar Contactos",
					message: "¿Desea importar contactos de otras listas a esta lista?",
					confirm: "Importar",
					cancel: "Cancelar"
				},
				table: {
					name: "Nombre",
					number: "Número",
					email: "Correo Electrónico",
					status: "Estado",
					actions: "Acciones",
					rowsPerPage: "Elementos por página",
					of: "de"
				},
				buttons: {
					add: "Agregar Contacto",
					import: "Importar / Exportar",
					importFile: "Importar Archivo",
					importContacts: "Importar Contactos",
					export: "Exportar Contactos",
					downloadTemplate: "Descargar Modelo",
					edit: "Editar",
					delete: "Eliminar",
					deleteSelected: "Eliminar Seleccionados"
				},
				searchPlaceholder: "Buscar por nombre, número o correo electrónico...",
				selected: "contactos seleccionados",
				valid: "Válido",
				invalid: "Inválido",
				empty: {
					noContacts: "No se encontraron contactos"
				},
				toasts: {
					added: "¡Contacto añadido con éxito!",
					updated: "¡Contacto actualizado exitosamente!",
					deleted: "¡Contacto eliminado con éxito!",
					deletedAll: "¡Contactos eliminados con éxito!",
					partialDeleteSuccess: "{success} contactos eliminados con éxito. {failed} no pudieron ser eliminados.",
					fetchError: "Error al buscar contactos.",
					saveError: "Error al guardar contacto.",
					deleteError: "Error al eliminar contacto.",
					importing: "Importando contactos. Esto puede llevar algunos minutos."
				}
			},
			contactListManager: {
				tooltips: {
					contacts: "Ver Contactos",
					import: "Importar",
					downloadTemplate: "Descargar Modelo"
				},
				buttons: {
					contacts: "Contactos",
					import: "Importar",
					downloadTemplate: "Descargar Modelo"
				},
				menu: {
					uploadFile: "Enviar Archivo",
					importContacts: "Importar desde Contactos",
					exportContacts: "Exportar Contactos"
				},
				importDialog: {
					title: "Importar Contactos",
					message: "¿Desea importar contactos de su WhatsApp a esta lista?",
					cancel: "Cancelar",
					confirm: "Importar"
				},
				errors: {
					noListSelected: "Ninguna lista de contactos seleccionada.",
					importError: "Error al importar contactos.",
					fileUploadError: "Error al enviar archivo."
				},
				toasts: {
					importing: "Importando contactos de WhatsApp...",
					exportSuccess: "¡Contactos exportados con éxito!",
					exportError: "Error al exportar contactos.",
					fileUploadSuccess: "Archivo importado con éxito!"
				}
			},
			campaignsConfig: {
				title: "Configuraciones de Campañas",
				intervalSettings: {
					title: "Configuraciones de Intervalo",
					messageInterval: "Intervalo entre Mensajes",
					longerIntervalAfter: "Intervalo Mayor Después",
					greaterInterval: "Intervalo Mayor",
					noInterval: "Sin Intervalo",
					second: "segundo",
					seconds: "segundos",
					notDefined: "No definido",
					sends: "envíos"
				},
				variables: {
					title: "Variables Personalizadas",
					add: "Añadir Variable",
					shortcut: "Atajo",
					content: "Contenido",
					shortcutPlaceholder: "Ej: saludo",
					contentPlaceholder: "Ej: ¡Hola, ¿cómo estás?",
					addButton: "Agregar",
					cancel: "Cancelar",
					empty: "Ninguna variable personalizada definida."
				},
				saveButton: "Guardar Configuraciones",
				warning: {
					title: "Atención al Uso de Campañas",
					content1: "El envío masivo de mensajes es una funcionalidad poderosa, pero sensible.",
					content2: "WhatsApp puede aplicar restricciones o bloqueos a su número, dependiendo de la configuración de tiempo y del volumen de mensajes.",
					content3: "Para evitar bloqueos, recomendamos configurar períodos de envío más espaciados y moderados.",
					regards: "Atentamente,",
					team: "Equipo"
				},
				confirmationModal: {
					deleteTitle: "Eliminar Variable",
					deleteMessage: "¿Está seguro de que desea eliminar esta variable?"
				},
				toasts: {
					success: "¡Configuraciones guardadas con éxito!",
					emptyVariable: "Complete todos los campos de la variable.",
					duplicatedVariable: "Ya existe una variable con este atajo.",
					fetchError: "Error al cargar configuraciones.",
					saveError: "Error al guardar configuraciones."
				}
			},
			delete: {
				warning: "¡Esta acción no se puede deshacer!",
				cancel: "Cancelar",
				confirm: "Eliminar",
				campaign: {
					title: "Eliminar Campaña",
					message: "¿Está seguro de que desea eliminar esta campaña?"
				},
				contactList: {
					title: "Eliminar Lista de Contactos",
					message: "¿Está seguro de que desea eliminar esta lista de contactos?"
				},
				item: {
					title: "Eliminar Elemento",
					message: "¿Está seguro de que desea eliminar este elemento?"
				}
			},
			empty: {
				title: "No se encontraron datos",
				message: "No hay datos para mostrar.",
				button: "Agregar"
			},
			optionsPage: {
				general: "General",
				integrations: "Integraciones",
				advanced: "Avanzado",
				ai: "Inteligencia Artificial",
				general_params: "Configuraciones Generales",
				downloadSettings: "Tamaño máximo de archivos (enviados y recibidos)",
				saveAll: "Guardar Todo",
				successMessage: "Operación actualizada con éxito.",
				allSettingsSaved: "Todas las configuraciones se guardaron con éxito.",
				onlyOneCloseOptionActive: "Solo una opción de cierre puede estar activa a la vez",
				openaiModel: "Modelo OpenAI",
				openaiModelHelp: "Elija el modelo de inteligencia artificial OpenAI para utilizar en las respuestas automáticas. Fundamental para garantizar la calidad y precisión de las respuestas automáticas, mejorando la eficiencia del servicio.",
				satisfactionSurveyTitle: "Encuesta de Satisfacción",
				enableSatisfactionSurvey: "Activar encuesta y reporte de satisfacción",
				enableSatisfactionSurveyHelp: "Activa o desactiva los recursos de encuesta de satisfacción e informes en el menú superior",
				satisfactionSurveyEnabled: "Encuesta de satisfacción activada con éxito",
				satisfactionSurveyDisabled: "Encuesta de satisfacción desactivada con éxito",
				enableOneTicketPerConnection: "Activar uso de un ticket por conexión",
				enableOneTicketPerConnectionHelp: "Al activar la funcionalidad de un ticket por conexión, si un cliente se pone en contacto con el equipo a través de diferentes conexiones, se generará un ticket distinto para cada una de ellas. El operador, por defecto, responderá por la conexión en la que recibió el mensaje.",
				enableOfficialWhatsapp: "Activar API Oficial de WhatsApp",
				enableOfficialWhatsappHelp: "Activa o desactiva el uso de la API oficial de WhatsApp Business para la comunicación. Importante para empresas que necesitan una conexión oficial y verificada con WhatsApp.",
				initialPage: "Página de Inicio",
				initialPageHelp: "Define cuál será la página de inicio del sistema al ser accedido. Elija entre la página de presentación (home) o la página de inicio de sesión directa.",
				homePage: "Página de Presentación (Home)",
				loginPage: "Página de Inicio de Sesión",
				enableQueueWhenCloseTicket: "Definir sector al cerrar la atención",
				enableQueueWhenCloseTicketHelp: "Solicita la selección de un sector (Setor) al cerrar una atención",
				enableTagsWhenCloseTicket: "Solicita la selección de etiquetas al cerrar una atención",
				enableTagsWhenCloseTicketHelp: "Solicita a seleção de tags ao encerrar um atendimento",
				enableRegisterInSignup: "Habilitar registro na tela inicial",
				enableRegisterInSignupHelp: "Habilita o deshabilita la opción de registro en la pantalla inicial, permitiendo que nuevos usuarios se registren en la plataforma cuando no tienen registro. Controla la visibilidad de la opción de registro, siendo crucial para gestionar el acceso de nuevos usuarios a la plataforma, manteniendo el control sobre quién puede registrarse.",
				sendEmailInRegister: "Enviar correo electrónico al registrar",
				sendEmailInRegisterHelp: "Enviar correo electrónico usando la empresa 1",
				downloadLimit: "Límite de Descarga",
				downloadLimitHelp: "Define el límite máximo para la descarga de archivos en megabytes. Crucial para evitar la sobrecarga en el sistema o el mal uso de la infraestructura al limitar el tamaño de los archivos transferidos.",
				sendMessageWhenRegiter: "Enviar mensaje al registrar",
				sendMessageWhenRegiterHelp: "Ao cadastrar-se, o sistema irá enviar uma mensagem de boas vindas. Essa configuração garante que, ao se registrar, uma mensagem de boas vindas será enviada, proporcionando uma comunicação clara e eficiente.",
				enableSaveCommonContacts: "Activar guardar contactos comunes",
				enableSaveCommonContactsHelp: "Permite salvar contatos que não estão cadastrados no WhatsApp. Ideal para manter um registro completo de todos os contatos, independentemente de possuírem uma conta no WhatsApp.",
				saveContactsEnabled: "Guardar contactos comunes activado.",
				saveContactsDisabled: "Guardar contactos comunes desactivado.",
				enableReasonWhenCloseTicket: "Mostrar modal de motivo al resolver ticket",
				enableReasonWhenCloseTicketHelp: "Al finalizar la atención, el sistema mostrará un modal para que el agente informe el motivo del cierre. Esta configuración garantiza el registro de los motivos de cierre de las atenciones, proporcionando un mayor control y análisis sobre los motivos de finalización, lo que puede ayudar en la mejora continua de la atención al cliente.",
				showSKU: "Mostrar valor del ticket y SKU",
				showSKUHelp: "Configura si el valor del ticket y SKU se mostrará en la atención. Importante para proporcionar información financiera detallada, optimizando la toma de decisiones durante la atención.",
				speedMessage: "Mensajes Rápidos",
				speedMessageHelp: "Define el uso de mensajes rápidos para facilitar la atención. Aumenta la productividad de los agentes, permitiendo respuestas rápidas y estandarizadas, ahorrando tiempo en atenciones repetitivas.",
				byCompany: "Por Empresa",
				byUser: "Por Usuario",
				sendanun: "Enviar saludo al aceptar ticket",
				sendanunHelp: "Define si se enviará automáticamente un mensaje de saludo al aceptar un nuevo ticket. Mejora la experiencia del cliente al recibir un saludo instantáneo, garantizando una interacción más acogedora y profesional.",
				sendQueuePosition: "Enviar mensaje con posición en la fila",
				sendQueuePositionHelp: "Define si el sistema enviará mensajes informando la posición del cliente en la fila de atención. Importante para mantener al cliente informado sobre su tiempo de espera estimado.",
				settingsUserRandom: "Elegir agente aleatorio",
				settingsUserRandomHelp: "Ativa ou desativa a seleção aleatória de atendentes para novos tickets. Útil para distribuir a carga de trabalho de forma mais equilibrada entre a equipe.",
				calif: "Activar evaluación automática",
				califHelp: "Configura la activación o desactivación de evaluaciones automáticas de la atención. Crucial para obtener retroalimentación continua de los clientes, permitiendo la mejora constante de la calidad del servicio.",
				expedient: "Gestión de Expediente",
				expedientHelp: "Activa o desactiva la gestión de expedientes para el control de horarios. Importante para optimizar la organización y garantizar que las atenciones se realicen dentro de los horarios establecidos.",
				buttons: {
					off: "Desactivado",
					partner: "Por Empresa",
					quee: "Por Sector"
				},
				ignore: "Ignorar grupos de WhatsApp",
				ignoreHelp: "Define si los grupos de WhatsApp serán ignorados en la atención. Esencial para centrarse en interacciones individuales, evitando distracciones y sobrecarga con grupos de conversación.",
				typechatbot: "Tipo de Chatbot",
				typechatbotHelp: "Define o tipo de chatbot que será utilizado, como texto ou outro formato. Essencial para personalizar a interação automática com os clientes, oferecendo uma experiência mais adaptada às necessidades do negócio.",
				text: "Texto",
				list: "Lista",
				button: "Botones",
				ticketSettings: "Opciones de Atención",
				contactSettings: "Opciones de Contactos",
				displayContactInfoDisabled: "Este recurso solo puede ser activado si Mostrar datos comerciales del contacto está desactivado",
				displayProfileImages: "Mostrar la foto de perfil del contacto y del usuario en la pantalla de atención",
				displayProfileImagesHelp: "Permite mostrar u ocultar la foto de perfil del contacto y también del usuario en los mensajes.",
				sendagent: "Enviar mensaje en la transferencia",
				donwloadSettings: "Configuraciones de Archivos Enviados/Recibidos",
				developmentPanels: "Paneles del Desarrollador",
				sendagentHelp: "Activa o desactiva el envío de mensajes automáticos al transferir una atención entre filas o agentes. Importante para mantener al cliente informado sobre el cambio de agentes, mejorando la transparencia y la experiencia del usuario.",
				greeatingOneQueue: "Enviar mensaje de saludo para sector único",
				greeatingOneQueueHelp: "Define si se enviará automáticamente un mensaje de saludo cuando la atención se transfiera a un sector único. Garantiza que el contacto reciba un saludo automático al ser transferido a un sector, manteniendo la atención más personal y organizada, incluso en filas con solo un agente.",
				callSuport: "Activar botón de soporte",
				callSuportHelp: "Activa o desactiva la función de llamar al soporte técnico directamente a través del sistema. Esencial para resolver problemas rápidamente, ofreciendo una solución inmediata a las cuestiones técnicas de los usuarios.",
				displayContactInfo: "Mostrar número de teléfono",
				displayContactInfoHelp: "Define si se mostrará el número de teléfono en lugar del nombre del contacto. Útil en situaciones donde el nombre del cliente puede no ser conocido, permitiendo una organización eficiente basada en el número de teléfono.",
				displayBusinessInfo: "Mostrar datos comerciales del contacto",
				displayBusinessInfoHelp: "Define si se mostrarán los datos comerciales (empresa y cargo) en la pantalla de atención. Útil para personalizar la atención en función del perfil profesional del contacto.",
				trialExpiration: "Días para prueba gratuita",
				trialExpirationHelp: "Define o número de dias disponíveis para teste gratuito do sistema. Crucial para atrair novos clientes, proporcionando uma experiência completa do sistema antes da contratação.",
				enableMetaPixel: "Activar Píxel de Meta",
				enableMetaPixelHelp: "Activa el uso del Píxel de Meta para todas las empresas",
				metaPixelEnabled: "Píxel de Meta activado con éxito",
				metaPixelDisabled: "Píxel de Meta desactivado con éxito",
				metaPixelSettings: "Configuraciones del Píxel de Meta",
				metaPixelId: "ID del Píxel de Meta",
				metaPixelIdHelp: "Ingrese el ID del Píxel de Meta para el seguimiento de conversiones",
				saveMetaPixelSettings: "Guardar Configuraciones del Píxel",
				enableGroupTool: "Habilitar Gestor de Grupos",
				enableGroupToolHelp: "Permite el uso de herramientas avanzadas para la gestión de grupos",
				groupToolEnabled: "Gestor de Grupos habilitado con éxito",
				groupToolDisabled: "Gestor de Grupos deshabilitado con éxito",
				enableMessageRules: "Habilitar Reglas de Mensajes",
				enableMessageRulesHelp: "Permite la creación y gestión de reglas para mensajes",
				messageRulesEnabled: "Reglas de Mensajes habilitadas con éxito",
				messageRulesDisabled: "Reglas de Mensajes deshabilitadas con éxito",
				enableUPSix: "Activar integración con UPSix",
				enableUPSixHelp: "Activa o desactiva la integración con UPSix en el sistema.",
				upsixEnabled: "Integración con UPSix activada.",
				upsixDisabled: "Integración con UPSix desactivada.",
				enableUPSixWebphone: "Activar webphone UPSix",
				enableUPSixWebphoneHelp: "Activa o desactiva el uso del webphone integrado de UPSix.",
				enableUPSixNotifications: "Activar notificaciones UPSix",
				enableUPSixNotificationsHelp: "Activa o desactiva las notificaciones a través de UPSix.",
				whatsappApiEnabled: "API Oficial de WhatsApp activada.",
				whatsappApiDisabled: "API Oficial de WhatsApp desactivada.",
				support: "Soporte",
				wasuport: "WhatsApp de Soporte",
				msgsuport: "Mensaje predefinido",
				apiToken: "Token de API",
				apiTokenHelp: "Token de acceso para integración con API externa.",
				generateToken: "Generar nuevo token",
				copyToken: "Copiar token",
				deleteToken: "Eliminar token",
				tokenCopied: "Token copiado al portapapeles",
				smtpServer: "Servidor SMTP",
				smtpUser: "Usuario SMTP",
				smtpPassword: "Contraseña SMTP",
				smtpPort: "Puerto SMTP",
				smtpHelp: "Configuraciones del servidor SMTP para enviar correos electrónicos a través del sistema.",
				days: "días"
			},
			backendErrors: {
				ERR_NO_OTHER_WHATSAPP: "Debe haber al menos un WhatsApp estándar.",
				ERR_CONNECTION_NOT_CONNECTED: "La conexión vinculada al ticket no está conectada en la plataforma, verifique la página de conexiones.",
				ERR_NO_DEF_WAPP_FOUND: "No se encontró ningún WhatsApp estándar. Verifique la página de conexiones.",
				ERR_WAPP_NOT_INITIALIZED: "Esta sesión de WhatsApp no se ha inicializado. Verifique la página de conexiones.",
				ERR_WAPP_CHECK_CONTACT: "No se pudo verificar el contacto de WhatsApp. Verifique la página de conexiones.",
				ERR_WAPP_INVALID_CONTACT: "Este no es un número de WhatsApp válido.",
				ERR_WAPP_DOWNLOAD_MEDIA: "No se pudo descargar medios de WhatsApp. Verifique la página de conexiones.",
				ERR_INVALID_CREDENTIALS: "Error de autenticación. Por favor, inténtelo de nuevo.",
				ERR_SENDING_WAPP_MSG: "Error al enviar mensaje de WhatsApp. Verifique la página de conexiones.",
				ERR_DELETE_WAPP_MSG: "No se pudo eliminar el mensaje de WhatsApp.",
				ERR_OTHER_OPEN_TICKET: "Ya hay un ticket abierto para este contacto.",
				ERR_SESSION_EXPIRED: "Sesión expirada. Por favor ingrese.",
				ERR_USER_CREATION_DISABLED: "La creación de usuarios ha sido deshabilitada por el administrador.",
				ERR_NO_PERMISSION: "No tienes permiso para acceder a este recurso.",
				ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
				ERR_NO_SETTING_FOUND: "No se encontró ninguna configuración con este ID.",
				ERR_NO_CONTACT_FOUND: "No se encontró ningún contacto con este ID.",
				ERR_NO_TICKET_FOUND: "No se encontró ningún ticket con este ID.",
				ERR_NO_USER_FOUND: "No se encontró ningún usuario con este ID.",
				ERR_NO_WAPP_FOUND: "No se encontró ningún WhatsApp con este ID.",
				ERR_NO_TAG_FOUND: "No se encontró ninguna etiqueta",
				ERR_CREATING_MESSAGE: "Error al crear mensaje en la base de datos.",
				ERR_CREATING_TICKET: "Error al crear ticket en la base de datos.",
				ERR_FETCH_WAPP_MSG: "Error al buscar el mensaje en WhatsApp, tal vez sea muy antiguo.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS: "Este color ya está en uso, por favor elija otro.",
				ERR_WAPP_GREETING_REQUIRED: "El mensaje de saludo es obligatorio cuando hay más de un sector.",
				ERR_NO_USER_DELETE: "No es posible eliminar al usuario Super",
				ERR_OUT_OF_HOURS: "¡Fuera del horario laboral!",
				ERR_QUICKMESSAGE_INVALID_NAME: "Nombre inválido",
				ERR_EDITING_WAPP_MSG: "No se pudo editar el mensaje de WhatsApp",
				ERR_CREATE_CONTACT_MSG: "¡Ups! Hubo un error al crear el contacto, actualice la página e inténtelo de nuevo, si el problema persiste, póngase en contacto con soporte técnico.",
				ERR_ACCESS_ANOTHER_COMPANY: "No es posible acceder a registros de otra empresa",
				ERR_THE_NUMBER: "O número",
				ERR_THE_NUMBER_IS_NOT_PRESENT_WITHIN_THE_GROUP: "não está presente dentro do grupo para realizar a extração dos contatos. É necessário que o mesmo esteja dentro do grupo para realizar a ação.",
				ERR_GENERIC: "¡Ups! Se produjo un error, actualiza la página e inténtalo de nuevo. Si el problema persiste, ponte en contacto con soporte técnico.",
				ERR_NAME_INTEGRATION_ALREADY_EXISTS: "Este nombre de integración ya está en uso.",
				ERR_NAME_INTEGRATION_OPENAI_ALREADY_EXISTS: "La integración con OpenAI ya está en uso.",
				ERR_NAME_INTEGRATION_MIN_2: "El nombre debe tener al menos 2 caracteres.",
				ERR_NAME_INTEGRATION_MAX_50: "El nombre debe tener como máximo 50 caracteres.",
				ERR_NAME_INTEGRATION_REQUIRED: "El nombre es obligatorio.",
				ERR_ACCESS_ANOTHER_COMPANY_INTEGRATION: "No es posible utilizar la integración de otra empresa.",
				ERR_NEED_COMPANY_ID_OR_TOKEN_DATA: "Es necesario companyId o tokenData.",
				ERR_ONLY_ACTIVE_USER_OR_ADMIN_CAN_EDIT_TICKET: "Solo el usuario activo del ticket o el Admin pueden realizar cambios en el ticket.",
				ERR_WHATSAPP_LINK_ERROR: "Se produjo un error al intentar localizar el WhatsApp asociado al usuario.",
				ERR_WHATSAPP_DEFAULT_NOT_FOUND: "WhatsApp predeterminado no encontrado.",
				ERR_WBOT_NOT_FOUND: "Wbot no encontrado.",
				ERR_SMTP_URL_NOT_FOUND: "Configuración de URL SMTP no encontrada.",
				ERR_SMTP_USER_NOT_FOUND: "Configuración de usuario SMTP no encontrada.",
				ERR_SMTP_PASSWORD_NOT_FOUND: "Configuración de contraseña SMTP no encontrada.",
				ERR_SMTP_PORT_NOT_FOUND: "Configuración de puerto SMTP no encontrada.",
				ERR_EMAIL_SENDING: "¡Ups! Se produjo un error al enviar el correo electrónico.",
				ERR_WHATSAPP_NOT_FOUND: "No se pudo encontrar el WhatsApp vinculado al usuario.",
				ERR_CONTACT_HAS_OPEN_TICKET: "Ya hay una atención abierta para este contacto.",
				ERR_TICKET_NOT_FOUND: "Ticket no encontrado.",
				ERR_SKU_REQUIRED: "SKU es obligatorio.",
				ERR_SKU_VALUE_REQUIRED: "Valor de SKU obligatorio.",
				ERR_INVALID_TICKET_ID: "Se proporcionó un ID de ticket no válido.",
				ERR_WORK_HOURS_UNDEFINED: "El horario de trabajo no ha sido definido.",
				ERR_INVALID_URL: "¡La URL proporcionada no es válida! Por favor, verifique que los datos de autenticación sean correctos en la pantalla de configuración del sistema e inténtelo de nuevo.",
				ERR_INTERNAL_SERVER_ERROR: "Se produjo un error interno del servidor.",
				ERR_CONNECTION_NOT_PROVIDED: "Conexión no informada.",
				ERR_INVALID_NUMBER_FORMAT: "Formato de número no válido. Solo se permiten números.",
				ERR_QUICKMESSAGE_MIN_3_CARACTERES: "El mensaje debe tener al menos 3 caracteres.",
				ERR_SHORTCUT_MIN_3_CHARACTERS: "El atajo debe tener al menos 3 caracteres.",
				ERR_NO_FILE_UPLOADED_QUICK_MESSAGE: "No se ha enviado ningún archivo.",
				ERR_QUICK_MESSAGE_NOT_FOUND: "Mensaje rápido no encontrado.",
				ERR_UNAUTHENTICATED_OR_UNIDENTIFIED_COMPANY: "Usuario no autenticado o empresa no identificada.",
				ERR_SHORTCODE_REQUIRED: "El atajo es obligatorio.",
				ERR_MESSAGE_REQUIRED: "El mensaje es obligatorio.",
				ERR_QUICKMESSAGE_REQUIRED: "La respuesta rápida es obligatoria.",
				ERR_FILE_EXTENSION_NOT_ALLOWED: "Tipo de archivo no permitido en la plataforma. Por favor, intente con otro tipo de archivo."
			}
		}
	}
};

export { messages };