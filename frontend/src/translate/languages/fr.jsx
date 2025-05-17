const messages = {
  fr: {
    translations: {
      languages: {
        undefined: "Langue",
        ptBr: "Portugais",
        es: "Espagnol",
        en: "Anglais",
        fr: "Français"
      },
      companySelector: {
        selectCompany: "Accéder en tant qu'administrateur...",
        accessingAs: "Accès en tant qu'administrateur de l'entreprise",
        returnToSuperAdmin: "Retour au compte principal",
        returnedToSuperAdmin: "Retour au compte de super administrateur"
      },
      whitelabel: {
        titles: {
          generalSettings: "Paramètres généraux",
          colorSettings: "Paramètres de couleur",
          logosAndBackgrounds: "Logos, icônes et images de fond"
        },
        labels: {
          systemName: "Nom du système",
          copyright: "Droits d'auteur",
          privacyPolicy: "Lien vers la politique de confidentialité",
          terms: "Lien vers les conditions d'utilisation",
          chooseColor: "Choisissez la couleur à modifier"
        },
        colors: {
          primaryColorLight: "Couleur primaire en mode clair",
          secondaryColorLight: "Couleur secondaire en mode clair",
          primaryColorDark: "Couleur primaire en mode sombre",
          secondaryColorDark: "Couleur secondaire en mode sombre",
          iconColorLight: "Couleur de l'icône en mode clair",
          iconColorDark: "Couleur de l'icône en mode sombre",
          chatlistLight: "Fond du chat interne en mode clair",
          chatlistDark: "Fond du chat interne en mode sombre",
          boxLeftLight: "Messages des autres en mode clair",
          boxLeftDark: "Messages des autres en mode sombre",
          boxRightLight: "Messages de l'utilisateur en mode clair",
          boxRightDark: "Messages de l'utilisateur en mode sombre"
        },
        images: {
          appLogoLight: "Logo pour le thème clair",
          appLogoDark: "Logo pour le thème sombre",
          appLogoFavicon: "Icône du FavIcon",
          appLogoPWAIcon: "Icône du PWA",
          loginBackground: "Image de fond pour l'écran de connexion",
          signupBackground: "Image de fond pour l'écran d'inscription"
        },
        success: {
          settingUpdated: "Configuration mise à jour avec succès",
          backgroundUpdated: "Image de fond mise à jour avec succès",
          backgroundDeleted: "Image de fond supprimée avec succès",
          logoUpdated: "Logo mis à jour avec succès"
        },
        errors: {
          settingUpdateFailed: "Erreur lors de la mise à jour de la configuration",
          backgroundUploadFailed: "Erreur lors du téléchargement de l'image de fond",
          backgroundDeleteFailed: "Erreur lors de la suppression de l'image de fond",
          logoUploadFailed: "Erreur lors du téléchargement du logo"
        }
      },
      company: {
        delete: "Supprimer",
        save: "Enregistrer",
        cancel: "Annuler",
        user: "Utilisateur",
        monthly: "Mensuel",
        bimonthly: "Bimestriel",
        quarterly: "Trimestriel",
        semiannual: "Semestriel",
        annual: "Annuel",
        recurrence: "Récurrence",
        enabled: "Activé",
        disabled: "Désactivé",
        campaigns: "Campagnes",
        active: "Actif",
        inactive: "Inactif",
        status: "Statut",
        plan: "Plan"
      },
      ticket: {
        notifications: {
          notificationWarningMessageUser: "Ce ticket ne peut pas être rouvert car il n'a pas de connexion associée. Le ticket a été fermé car la connexion a été supprimée."
        },
        buttons: {
          cancel: "Annuler",
          confirm: "Confirmer",
          refresh: "Mettre à jour la liste des services"
        },
        emailPdf: {
          title: "Envoyer le service par e-mail",
          emailLabel: "E-mail du destinataire",
          subjectLabel: "Sujet",
          messageLabel: "Message",
          sendButton: "Envoyer",
          cancelButton: "Annuler",
          success: "E-mail envoyé avec succès!",
          error: "Erreur lors de l'envoi de l'e-mail. Veuillez réessayer.",
          missingInfo: "Veuillez remplir tous les champs obligatoires."
        },
        pdfExport: {
          generating: "Génération du PDF...",
          elementsNotFound: "Impossible de trouver le contenu du service",
          fileTooLarge: "Le fichier PDF généré est trop volumineux. Maximum de 10 Mo.",
          generationError: "Erreur lors de la génération du PDF. Veuillez réessayer."
        },
        menuItem: {
          sku: "Définir la valeur et le SKU du ticket",
          transfer: "Transférer le service",
          schedule: "Planification",
          deleteTicket: "Supprimer le ticket",
          createTask: "Créer une tâche"
        },
        queueModal: {
          title: "Sélectionner le secteur",
          queue: "Secteur"
        },
        tagModal: {
          title: "Sélectionner les tags",
          select: "Tags",
          placeholder: "Sélectionner un ou plusieurs tags"
        },
        vcard: {
          buttonSave: "Enregistrer",
          buttonConversation: "Discuter"
        },
        toasts: {
          savedContactSuccess: "Contact enregistré avec succès."
        },
        sku: {
          skuValue: "Valeur du billet",
          skuCode: "Code SKU",
          updatedTicketValueSuccessSku: "Valeur mise à jour avec succès!"
        },
        actionButtons: {
          exportPDF: "Exporter en PDF",
          close: "Fermer"
        },
        noMessagesSelected: "Aucun message sélectionné"
      },
      genericError: "Oups! Une erreur s'est produite, veuillez rafraîchir la page et réessayer. Si le problème persiste, veuillez contacter le support technique.",
      signup: {
        title: "Créer un compte",
        unavailable: "Inscription indisponible pour le moment",
        steps: {
          person: "Données personnelles",
          company: "Données de l'entreprise",
          address: "Adresse",
          access: "Accès"
        },
        form: {
          personType: "Type de personne",
          personTypes: {
            physical: "Personne physique",
            legal: "Personne morale"
          },
          cpf: "CPF",
          cnpj: "CNPJ",
          fullName: "Nom complet",
          razaoSocial: "Raison sociale",
          email: "E-mail",
          phone: "Téléphone",
          password: "Mot de passe",
          cep: "Code postal",
          estado: "État",
          cidade: "Ville",
          bairro: "Quartier",
          logradouro: "Adresse",
          numero: "Numéro",
          noNumber: "Sans numéro",
          plan: "Plan",
          users: "Utilisateurs",
          queues: "Secteurs",
          loading: "Chargement...",
          acceptTerms: "J'ai lu et j'accepte les",
          terms: "Conditions d'utilisation",
          and: "e",
          privacy: "Politique de confidentialité"
        },
        validation: {
          required: "Champ obligatoire",
          emailExists: "Cet e-mail est déjà utilisé",
          phoneExists: "Ce numéro de téléphone est déjà utilisé",
          invalidDocument: "Document invalide",
          terms: "Vous devez accepter les conditions d'utilisation",
          password: {
            requirements: "Exigences du mot de passe",
            length: "Minimum de 8 caractères",
            lowercase: "Au moins une lettre minuscule",
            uppercase: "Au moins une lettre majuscule",
            number: "Au moins un chiffre",
            special: "Au moins un caractère spécial (@$!%*?&)"
          }
        },
        passwordStrength: {
          weak: "Mot de passe faible",
          medium: "Mot de passe moyen",
          strong: "Mot de passe fort"
        },
        buttons: {
          next: "Suivant",
          back: "Retour",
          submit: "S'inscrire",
          login: "Se connecter",
          loginText: "Vous avez déjà un compte?"
        },
        toasts: {
          success: "Inscription réussie!",
          error: "Erreur lors de l'inscription",
          errorPassword: "Erreur de validation du mot de passe",
          errorPlan: "Erreur de sélection du plan",
          errorFields: "Erreur de validation des champs",
          errorDocument: "Erreur de validation du document",
          errorAddress: "Erreur lors de la recherche d'adresse",
          errorEmail: "Erreur de validation de l'e-mail",
          errorPhone: "Erreur de validation du téléphone"
        }
      },
      forgotPassword: {
        title: "J'ai oublié mon mot de passe",
        resetTitle: "Réinitialiser le mot de passe",
        email: "E-mail",
        token: "Code de vérification",
        newPassword: "Nouveau mot de passe",
        confirmPassword: "Confirmez le nouveau mot de passe",
        sendEmail: "Envoyer un e-mail",
        resetPassword: "Réinitialiser le mot de passe",
        cancel: "Annuler",
        invalidEmail: "E-mail invalide",
        requiredEmail: "L'e-mail est obligatoire",
        requiredToken: "Le code de vérification est obligatoire",
        invalidToken: "Code de vérification invalide",
        requiredPassword: "Le nouveau mot de passe est obligatoire",
        minPassword: "Le mot de passe doit contenir au moins 8 caractères",
        passwordRequirements: "Le mot de passe doit contenir au moins une lettre majuscule, une minuscule et un chiffre",
        passwordMatch: "Les mots de passe ne correspondent pas",
        requiredConfirmPassword: "La confirmation du mot de passe est obligatoire",
        emailSent: "E-mail envoyé avec succès! Veuillez vérifier votre boîte de réception",
        emailError: "Erreur lors de l'envoi de l'e-mail. Veuillez réessayer",
        resetSuccess: "Mot de passe réinitialisé avec succès!",
        resetError: "Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer",
        sendEmailTooltip: "Envoyer un e-mail avec un code de vérification",
        resetPasswordTooltip: "Confirmer le nouveau mot de passe"
      },
      reports: {
        title: "Rapports de service",
        description: "Visualisez et analysez les données des services effectués dans votre entreprise.",
        filters: {
          title: "Filtres",
          startDate: "Date de début",
          endDate: "Date de fin",
          status: "Statut",
          user: "Agent",
          queues: "Secteur",
          queue: "Secteur",
          allQueue: "Tous les secteurs",
          tags: "Tags",
          search: "Rechercher",
          period: "Période",
          filterBy: "Filtrer par",
          employer: "Entreprise",
          allEmployers: "Toutes les entreprises",
          clearFilters: "Effacer les filtres",
          allStatus: "Tous les statuts",
          statusOpen: "Ouvert",
          statusPending: "En attente",
          statusClosed: "Fermé",
          allUsers: "Tous les agents"
        },
        tabs: {
          data: "Données",
          export: "Exporter",
          charts: "Graphiques",
          exportCsv: "Exporter CSV"
        },
        table: {
          columns: {
            id: "ID",
            contact: "Contact",
            queue: "Secteur",
            user: "Agent",
            status: "Statut",
            createdAt: "Créé le",
            updatedAt: "Mis à jour le",
            tags: "Tags"
          },
          noData: "Aucune donnée trouvée pour les filtres sélectionnés.",
          rowsPerPage: "Lignes par page :",
          of: "de",
          unknown: "Inconnu"
        },
        status: {
          open: "Ouvert",
          pending: "En attente",
          closed: "Fermé"
        },
        export: {
          preview: "Aperçu",
          previewNote: "Affichage de {shown} sur {total} enregistrements",
          summary: "Résumé",
          totalTickets: "Total des assistances",
          totalMessages: "Total des messages",
          avgMessagesPerTicket: "Moyenne de messages par assistance",
          avgAttendanceTime: "Temps moyen de traitement",
          statusDistribution: "Répartition par statut",
          reportTitle: "Rapport d'assistance",
          periodLabel: "Période",
          options: "Options d'exportation",
          includeLogo: "Inclure le logo de l'entreprise",
          exportPdf: "Exporter en PDF",
          generating: "En cours de génération...",
          success: "Rapport exporté avec succès !",
          error: "Erreur lors de l'exportation du rapport. Veuillez réessayer.",
          logoPlaceholder: "Logo de l'entreprise (sera inclus dans le PDF)"
        },
        exportCsv: {
          title: "Exportation vers CSV",
          description: "Exportez les tickets filtrés vers un fichier CSV qui peut être ouvert dans Excel ou d'autres programmes de tableur.",
          filePreview: "Aperçu du fichier CSV",
          preview: "APERÇU",
          generating: "Génération du CSV...",
          filters: "Filtres",
          exportButton: "Exporter CSV",
          fileStructure: "Structure du fichier de retour",
          success: "CSV généré avec succès. Le téléchargement commencera automatiquement.",
          errorCsv: "Erreur lors de la génération du fichier CSV. Veuillez réessayer.",
          noDataToExport: "Aucune donnée à exporter avec les filtres sélectionnés.",
          infoMessage: "Le fichier CSV inclura tous les tickets correspondant aux filtres appliqués. Les données seront exportées sous forme de tableau avec des en-têtes.",
          instructions: "Instructions d'utilisation",
          instruction1: "Le fichier CSV généré peut être importé dans des programmes tels que Microsoft Excel, Google Sheets ou LibreOffice Calc.",
          instruction2: "Pour ouvrir dans Excel, il suffit de double-cliquer sur le fichier téléchargé ou d'utiliser l'option 'Ouvrir' dans Excel et de localiser le fichier.",
          instruction3: "Si les caractères spéciaux n'apparaissent pas correctement, choisissez l'option UTF-8 lors de l'ouverture du fichier."
        },
        charts: {
          title: "Analyse graphique",
          daily: "Journalier",
          weekly: "Hebdomadaire",
          monthly: "Mensuel",
          ticketsByQueue: "Assistance par Secteur",
          ticketsByStatus: "Assistance par Statut",
          ticketsTrend: "Tendance des Assistances",
          tickets: "Assistances",
          topUsers: "Meilleurs Agents",
          topQueues: "Meilleurs Secteurs",
          noData: "Aucune donnée disponible pour la période sélectionnée."
        },
        errors: {
          loadFailed: "Échec du chargement des données. Veuillez réessayer.",
          chartLoadFailed: "Échec du chargement des graphiques. Veuillez réessayer.",
          summaryLoadFailed: "Échec du chargement du résumé. Veuillez réessayer."
        }
      },
      queueModal: {
        title: {
          add: "Ajouter un secteur",
          edit: "Modifier le secteur",
          delete: "Supprimer le secteur"
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Êtes-vous sûr ? Cette action est irréversible ! et sera supprimée des secteurs et connexions associées"
        },
        serviceHours: {
          sunday: "dimanche",
          monday: "lundi",
          tuesday: "mardi",
          wednesday: "mercredi",
          thursday: "jeudi",
          friday: "vendredi",
          saturday: "samedi"
        },
        form: {
          name: "Nom",
          newTicketOnTransfer: "Créer un nouveau ticket lors du transfert",
          color: "Couleur",
          keywords: "Mots-clés pour le transfert",
          greetingMessage: "Message de salutation",
          complationMessage: "Message de conclusion",
          outOfHoursMessage: "Message hors des heures de bureau",
          ratingMessage: "Message d'évaluation",
          token: "Jeton",
          orderQueue: "Ordre du Secteur (Bot)",
          integrationId: "Intégration",
          closeTicket: "Fermer le ticket",
          tags: "Tags (Kanban)"
        },
        buttons: {
          okAdd: "Ajouter",
          okEdit: "Enregistrer",
          cancel: "Annuler",
          attach: "Joindre un fichier"
        },
        toasts: {
          deleted: "Secteur supprimé avec succès.",
          inserted: "Secteur créé avec succès.",
          tagsError: "Erreur lors de la recherche des tags"
        },
        tabs: {
          queue: "Secteur",
          schedules: "Horaires"
        }
      },
      queueOptions: {
        title: "Titre",
        addChild: "Ajouter une sous-option",
        editing: "Édition de l'option",
        add: "Ajouter une option",
        optionType: "Type d'option",
        message: "Message",
        noMessage: "Pas de message",
        save: "Enregistrer",
        delete: "Supprimer",
        preview: {
          title: "Aperçu de l'option",
          mediaFile: "Fichier multimédia",
          contactCard: "Carte de contact",
          transferTo: "Transférer vers",
          note: "Ceci est un aperçu de la façon dont l'option sera affichée pour l'utilisateur",
          close: "Fermer"
        },
        untitled: "Pas de titre",
        attachFile: "Joindre un fichier",
        selectedContact: "Contact sélectionné",
        selectContact: "Sélectionner un contact",
        changeContact: "Modifier le contact",
        targetQueue: "Secteur de destination",
        selectQueue: "Sélectionnez un secteur",
        targetUser: "Agent de destination",
        selectUser: "Sélectionnez un agent",
        targetWhatsapp: "Connexion de destination",
        selectWhatsapp: "Sélectionnez une connexion",
        validationType: "Type de validation",
        selectValidationType: "Sélectionnez un type de validation",
        validationRegex: "Expression Régulière",
        validationRegexPlaceholder: "Ex: ^[0-9]{11}$",
        validationRegexHelp: "Expression régulière pour valider l'entrée de l'utilisateur",
        validationErrorMessage: "Message d'erreur",
        validationErrorMessagePlaceholder: "Veuillez entrer une valeur valide",
        conditionalLogicTitle: "Logique Conditionnelle",
        conditionalLogicDescription: "Configurez des conditions pour diriger l'utilisateur vers différentes options",
        conditionalVariable: "Variable Conditionnelle",
        selectConditionalVariable: "Sélectionnez une variable",
        conditions: "Conditions",
        operator: "Opérateur",
        value: "Valeur",
        targetOption: "Option de destination",
        selectTargetOption: "Sélectionnez une option",
        addCondition: "Ajouter une condition",
        defaultOption: "Option par défaut",
        defaultOptionDescription: "Option qui sera sélectionnée si aucune condition n'est remplie",
        noDefaultOption: "Aucune option par défaut",
        optionTypes: {
          text: "Texte",
          audio: "Audio",
          video: "Vidéo",
          image: "Image",
          document: "Document",
          contact: "Contact",
          transferQueue: "Transférer vers le service",
          transferUser: "Transférer vers l'agent",
          transferWhatsapp: "Transférer vers la connexion",
          validation: "Validation",
          conditional: "Conditionnel"
        },
        validationTypes: {
          cpf: "CPF",
          email: "E-mail",
          phone: "Téléphone",
          custom: "Personnalisé"
        },
        conditionalVariables: {
          lastMessage: "Dernier message de l'utilisateur"
        },
        operators: {
          equals: "Égal à",
          contains: "Contient",
          startsWith: "Commence par",
          endsWith: "Se termine par",
          regex: "Expression Régulière"
        },
        contactSearch: {
          title: "Rechercher un contact",
          searchPlaceholder: "Entrez le nom ou le numéro",
          noResults: "Aucun contact trouvé",
          startTyping: "Tapez pour rechercher des contacts",
          cancel: "Annuler"
        }
      },
      login: {
        title: "Connexion",
        title2: "Se connecter",
        forgotPassword: "J'ai oublié mon mot de passe",
        invalidCredentials: "E-mail ou mot de passe incorrect. Veuillez réessayer.",
        missingFields: "Veuillez remplir tous les champs.",
        rememberMe: "Se souvenir de moi",
        form: {
          email: "E-mail",
          password: "Mot de passe",
          emailPlaceholder: "Entrez votre e-mail",
          passwordPlaceholder: "Entrez votre mot de passe"
        },
        buttons: {
          submit: "Se connecter",
          register: "Pas de compte? Inscrivez-vous!",
          returlogin: "Retour au menu principal",
          send: "Envoyer un e-mail"
        }
      },
      plans: {
        form: {
          name: "Nom",
          users: "Utilisateurs",
          connections: "Connexions",
          queue: "Secteurs",
          campaigns: "Campagnes",
          schedules: "Rendez-vous",
          email: "E-mail",
          chat: "Chat interne",
          isVisible: "Montrer",
          delete: "Voulez-vous vraiment supprimer cet enregistrement?",
          api: "API externe",
          kanban: "Kanban",
          whiteLabel: "Styliseur",
          integrations: "Intégrations",
          openAIAssistants: "Agents IA",
          flowBuilder: "Constructeur de flux",
          apiOfficial: "API officielle",
          chatBotRules: "Règles de ChatBot",
          storageLimit: "Limite de stockage (Mo)",
          contentLimit: "Limite de contenu des agents (Mo)",
          enabled: "Activé",
          disabled: "Désactivé",
          clear: "Annuler",
          save: "Enregistrer",
          yes: "Oui",
          no: "Non",
          money: "R$"
        }
      },
      companies: {
        title: "Gestion des entreprises",
        searchPlaceholder: "Rechercher une entreprise...",
        table: {
          id: "ID",
          status: "Statut",
          name: "Nom/Raison sociale",
          email: "E-mail",
          value: "Valeur",
          dueDate: "Échéance",
          actions: "Actions"
        },
        status: {
          active: "Actif",
          inactive: "Inactif"
        },
        buttons: {
          new: "Nouvelle entreprise",
          view: "Voir",
          edit: "Éditer",
          delete: "Supprimer",
          cancel: "Annuler",
          save: "Enregistrer",
          emailInvoice: "Envoyer la facture par e-mail",
          whatsappInvoice: "Envoyer la facture par WhatsApp"
        },
        fields: {
          personType: "Type de personne",
          name: "Nom",
          companyName: "Raison sociale",
          document: "Document",
          email: "E-mail",
          phone: "Téléphone",
          status: "Statut",
          plan: "Plan",
          zipCode: "Code postal",
          state: "État",
          city: "Ville",
          neighborhood: "Quartier",
          street: "Adresse",
          number: "Numéro",
          currentPlan: "Plan actuel",
          value: "Valeur",
          dueDate: "Date d'échéance",
          dueDay: "Jour d'échéance",
          recurrence: "Récurrence"
        },
        personType: {
          individual: "Personne physique",
          company: "Personne morale"
        },
        recurrence: {
          monthly: "Mensuel",
          quarterly: "Trimestriel",
          semiannual: "Semestriel",
          annual: "Annuel"
        },
        details: {
          title: "Détails de l'entreprise",
          tabs: {
            main: "Données principales",
            address: "Adresse",
            billing: "Plan et facturation",
            resources: "Ressources"
          }
        },
        resources: {
          whatsapp: "Connexions WhatsApp",
          users: "Utilisateurs",
          queues: "Secteurs"
        },
        edit: {
          title: "Modifier l'entreprise",
          tabs: {
            main: "Données principales",
            address: "Adresse",
            billing: "Plan et facturation"
          },
          validation: {
            nameRequired: "Le nom est obligatoire",
            nameMin: "Le nom doit comporter au moins 2 caractères",
            emailRequired: "L'e-mail est obligatoire",
            emailInvalid: "E-mail invalide",
            phoneRequired: "Le téléphone est obligatoire",
            phoneOnlyNumbers: "Le téléphone ne doit contenir que des chiffres",
            phoneMin: "Le téléphone doit comporter au moins 10 chiffres",
            phoneMax: "Le téléphone doit comporter au maximum 11 chiffres",
            planRequired: "Le plan est obligatoire",
            dueDayFormat: "Le jour d'échéance doit être un nombre",
            dueDayRange: "Le jour d'échéance doit être compris entre 1 et 28",
            zipFormat: "Le code postal doit comporter 8 chiffres",
            stateFormat: "L'état doit comporter 2 lettres"
          },
          errors: {
            loadPlans: "Erreur lors du chargement des plans",
            update: "Erreur lors de la mise à jour de l'entreprise"
          },
          success: "Entreprise mise à jour avec succès"
        },
        deleteDialog: {
          title: "Confirmer la suppression",
          message: "Voulez-vous vraiment supprimer l'entreprise {name}?"
        },
        toasts: {
          loadError: "Erreur lors du chargement des entreprises",
          deleted: "Entreprise supprimée avec succès",
          deleteError: "Erreur lors de la suppression de l'entreprise",
          invoiceSentemailSuccess: "Facture envoyée par e-mail avec succès",
          invoiceSentwhatsappSuccess: "Facture envoyée par WhatsApp avec succès",
          invoiceSentemailError: "Erreur lors de l'envoi de la facture par e-mail",
          invoiceSentwhatsappError: "Erreur lors de l'envoi de la facture par WhatsApp"
        },
        confirmations: {
          deleteTitle: "Supprimer l'entreprise",
          deleteMessage: "Voulez-vous vraiment supprimer cette entreprise? Cette action est irréversible."
        },
        notifications: {
          deleteSuccess: "Entreprise supprimée avec succès",
          deleteError: "Erreur lors de la suppression de l'entreprise",
          updateSuccess: "Entreprise mise à jour avec succès",
          updateError: "Erreur lors de la mise à jour de l'entreprise"
        }
      },
      auth: {
        toasts: {
          success: "Connexion réussie!"
        },
        token: "Jeton"
      },
      companyModal: {
        form: {
          numberAttendants: "Nombre d'agents",
          numberConections: "Nombre de connexions"
        },
        success: "Entreprise modifiée avec succès.",
        add: "Entreprise ajoutée avec succès."
      },
      dashboard: {
        tabs: {
          indicators: "Indicateurs",
          assessments: "NPS",
          attendants: "Agents"
        },
        charts: {
          perDay: {
            title: "Appels aujourd'hui: "
          },
          filters: {
            startDate: "Date de début",
            endDate: "Date de fin",
            periodText: "Période",
            periodOptions: {
              input: "Sélectionnez la période souhaitée",
              zero: "Aucune période sélectionnée",
              three: "Trois derniers jours",
              seven: "Sept derniers jours",
              fifteen: "Quinze derniers jours",
              thirty: "Trente derniers jours",
              sixty: "Soixante derniers jours",
              ninety: "Quatre-vingt-dix derniers jours"
            },
            duedate: "Date d'échéance",
            filtertype: {
              title: "Type de filtre",
              valueA: "Filtrer par date",
              valueB: "Filtrer par période",
              helperText: "Sélectionnez la période souhaitée"
            }
          }
        },
        cards: {
          attdPendants: "Appels en attente",
          attdHappening: "Appels en cours",
          attdPerformed: "Appels réalisés",
          leads: "Leads",
          mtofService: "Temps moyen de traitement",
          mtofwaiting: "Temps moyen d'attente",
          inAttendance: "En cours",
          waiting: "En attente",
          activeAttendants: "Agents actifs",
          finalized: "Terminé",
          newContacts: "Nouveaux contacts",
          totalReceivedMessages: "Messages reçus",
          totalSentMessages: "Messages envoyés",
          averageServiceTime: "Temps moyen de traitement",
          averageWaitingTime: "Temps moyen d'attente",
          status: "Statut (Actuel)"
        },
        date: {
          initialDate: "Date de début",
          finalDate: "Date de fin"
        },
        users: {
          name: "Nom",
          numberAppointments: "Nombre de services",
          statusNow: "Actuel",
          totalCallsUser: "Total des services par utilisateur",
          totalAttendances: "Total des services"
        },
        licence: {
          available: "Disponible jusqu'à"
        },
        assessments: {
          totalCalls: "Total des assistances",
          callsWaitRating: "Services en attente d'évaluation",
          callsWithoutRating: "Services sans évaluation",
          ratedCalls: "Services évalués",
          evaluationIndex: "Indice d'évaluation",
          score: "Score",
          prosecutors: "Promoteurs",
          neutral: "Neutres",
          detractors: "Détracteurs"
        },
        stadis: {
          name: "Nom",
          calif: "Évaluations",
          timemedia: "Temps moyen de traitement",
          statuschat: "Statut (Actuel)"
        }
      },
      internalChat: {
        deletePrompt: "Cette action ne peut pas être annulée, confirmer?"
      },
      messageRules: {
        title: "Identifiants de messages",
        searchPlaceholder: "Rechercher par nom, modèle ou description...",
        emptyState: {
          title: "Aucun identifiant trouvé",
          description: "Vous n'avez pas encore configuré d'identifiants de messages. Ajoutez votre premier identifiant pour automatiser le routage des messages.",
          button: "Ajouter un identifiant"
        },
        table: {
          name: "Nom",
          pattern: "Modèle",
          connection: "Connexion",
          queue: "Secteur",
          user: "Agent",
          tags: "Étiquettes",
          priority: "Priorité",
          status: "Statut",
          actions: "Actions"
        },
        tabs: {
          all: "Tous",
          active: "Actifs",
          inactive: "Inactifs"
        },
        form: {
          name: "Nom de l'identifiant",
          pattern: "Modèle de texte",
          patternHint: "Entrez un texte qui doit être trouvé dans les messages. Ex: 'commande', 'support', 'devis'",
          isRegex: "Utiliser une expression régulière",
          isRegexHint: "Activez pour utiliser des expressions régulières (regex) pour des modèles plus complexes",
          description: "Description",
          connection: "Connexion",
          allConnections: "Toutes les connexions",
          queue: "Secteur de destination",
          noQueue: "Sélectionnez un secteur",
          user: "Agent de destination",
          noUser: "Sélectionnez un agent",
          priority: "Priorité",
          priorityHint: "Les règles les plus prioritaires sont appliquées en premier (0-100)",
          tags: "Étiquettes à appliquer",
          selectTags: "Sélectionnez des étiquettes",
          active: "Actif",
          errors: {
            requiredName: "Le nom est obligatoire",
            requiredPattern: "Le motif de texte est obligatoire"
          }
        },
        buttons: {
          add: "Ajouter un identifiant",
          edit: "Éditer",
          delete: "Supprimer",
          save: "Enregistrer",
          cancel: "Annuler",
          activate: "Activer",
          deactivate: "Désactiver"
        },
        modal: {
          addTitle: "Ajouter un identifiant de message",
          editTitle: "Modifier l'identifiant de message"
        },
        confirmModal: {
          title: "Supprimer l'identifiant",
          message: "Êtes-vous sûr de vouloir supprimer cet identifiant de message ? Cette action est irréversible."
        },
        toasts: {
          created: "Identifiant créé avec succès !",
          updated: "Identifiant mis à jour avec succès !",
          deleted: "Identifiant supprimé avec succès !",
          activated: "Identifiant activé avec succès !",
          deactivated: "Identifiant désactivé avec succès !"
        },
        noRecords: "Aucun identifiant trouvé pour les filtres sélectionnés.",
        active: "Actif",
        inactive: "Inactif",
        allConnections: "Toutes les connexions"
      },
      messageIdentifiers: {
        title: "Identifiants de messages",
        description: "Configurez des règles pour le traitement automatique des messages",
        createRule: "Créer un nouvel identifiant",
        editRule: "Modifier l'identifiant",
        deleteRule: "Supprimer l'identifiant",
        selectConnection: "Sélectionnez la connexion",
        selectTags: "Sélectionner les tags",
        selectQueue: "Sélectionner le secteur",
        selectUser: "Sélectionnez l'utilisateur (facultatif)",
        patternHelp: "Le système vérifiera chaque message reçu pour trouver ce motif",
        regexHelp: "Utilisez des expressions régulières pour des motifs plus complexes",
        priorityHelp: "Les règles les plus prioritaires seront appliquées en premier"
      },
      messageHistoryModal: {
        close: "Fermer",
        title: "Historique de modification du message"
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "FAITES GLISSER ET DÉPOSEZ DES FICHIERS DANS LE CHAMP CI-DESSOUS",
          titleFileList: "Liste de fichier(s)"
        }
      },
      whatsappModal: {
        title: {
          add: "Nouvelle connexion",
          edit: "Modifier la connexion",
          editOfficial: "Modifier la connexion WhatsApp officielle",
          addOfficial: "Ajouter une connexion WhatsApp officielle"
        },
        form: {
          name: "Nom",
          default: "Modèle",
          group: "Autoriser les groupes",
          autoImport: "Importer des contacts",
          autoReject: "Refuser les appels",
          availableQueues: "Secteurs",
          uploadMedia: "Téléchargement de médias",
          clearMedia: "Effacer les médias",
          token: "Jeton d'accès",
          fileSize: "Taille maximale du fichier : 5MB",
          showQrCodeAfterSave: "Afficher le code QR après avoir enregistré la connexion",
          importOldMessagesEnable: "Importer d'anciens messages",
          importOldMessagesGroups: "Importer des messages de groupes",
          closedTicketsPostImported: "Fermer les tickets après l'importation",
          importOldMessages: "Date de début pour l'importation",
          importRecentMessages: "Date de fin pour l'importation",
          importAlert: "L'importation peut prendre du temps en fonction de la quantité de messages. Veuillez patienter.",
          queueRedirection: "Redirection de secteur",
          queueRedirectionDesc: "Sélectionnez vers quel secteur les tickets seront redirigés et après combien de temps",
          sendIdQueue: "Secteur de redirection",
          timeSendQueue: "Temps de redirection (minutes)",
          integrationId: "ID de l'intégration",
          prompt: "Invite d'IA",
          disabled: "Désactivé",
          greetingMessage: "Message de bienvenue",
          complationMessage: "Message de conclusion",
          outOfHoursMessage: "Message hors des heures de bureau",
          ratingMessage: "Message d'évaluation",
          collectiveVacationMessage: "Message de vacances collectives",
          collectiveVacationStart: "Début des vacances collectives",
          collectiveVacationEnd: "Fin des vacances collectives",
          timeCreateNewTicket: "Temps pour créer un nouveau ticket (minutes)",
          maxUseBotQueues: "Limite d'utilisation du chatbot",
          timeUseBotQueues: "Intervalle d'utilisation du chatbot (minutes)",
          expiresTicket: "Fermer les tickets après (heures)",
          whenExpiresTicket: "Quand fermer",
          closeLastMessageOptions1: "Dernier message du client",
          closeLastMessageOptions2: "Dernier message de l'agent",
          expiresInactiveMessage: "Message d'inactivité",
          timeInactiveMessage: "Temps pour le message d'inactivité (minutes)",
          inactiveMessage: "Message d'inactivité",
          color: "Couleur du badge",
          connectionInfo: "Informations de la connexion",
          metaApiConfig: "Configuration de l'API Meta",
          officialWppBusinessId: "ID de l'entreprise WhatsApp",
          officialPhoneNumberId: "ID du numéro de téléphone",
          officialAccessToken: "Jeton d'accès",
          queuesAndIntegrations: "Files et Intégrations",
          messages: "Messages",
          settings: "Paramètres"
        },
        buttons: {
          okAdd: "Enregistrer",
          okEdit: "Enregistrer",
          cancel: "Annuler",
          refresh: "Mettre à jour le jeton",
          copy: "Copier le jeton",
          upload: "Ajouter une image",
          help: "Aide"
        },
        tabs: {
          general: "Général",
          integrations: "Intégrations",
          messages: "Messages",
          chatbot: "Chatbot",
          assessments: "Évaluations",
          schedules: "Horaires"
        },
        help: {
          title: "Aide - WhatsApp",
          description: "Configuration de la connexion avec WhatsApp",
          required: "Champs obligatoires",
          name: "Nom: Identification unique de la connexion",
          queue: "Secteur: Secteur par défaut pour l'orientation des tickets"
        },
        validation: {
          nameRequired: "Le nom est obligatoire",
          nameMin: "Le nom doit comporter au moins 2 caractères",
          nameMax: "Le nom doit comporter au maximum 50 caractères",
          collectiveVacationStartRequired: "La date de début des vacances est obligatoire",
          collectiveVacationEndRequired: "La date de fin des vacances est obligatoire",
          collectiveVacationEndAfterStart: "La date de fin doit être postérieure à la date de début",
          timeCreateNewTicketMin: "Le temps doit être supérieur ou égal à 0",
          maxUseBotQueuesMin: "La limite doit être supérieure ou égale à 0",
          expiresTicketMin: "Le temps doit être supérieur ou égal à 0",
          tokenRequired: "Le jeton d'accès est obligatoire",
          businessIdRequired: "L'identifiant de l'entreprise WhatsApp est obligatoire",
          phoneNumberIdRequired: "L'identifiant du numéro de téléphone est obligatoire"
        },
        success: {
          saved: "WhatsApp enregistré avec succès!",
          update: "WhatsApp mis à jour avec succès!"
        },
        tokenRefreshed: "Jeton mis à jour avec succès!",
        tokenCopied: "Jeton copié dans le presse-papiers!",
        scheduleSaved: "Horaires enregistrés avec succès!",
        errors: {
          fetchData: "Erreur lors du chargement des données",
          fetchWhatsApp: "Erreur lors du chargement des données WhatsApp",
          saveWhatsApp: "Erreur lors de l'enregistrement de WhatsApp",
          fileSize: "Fichier trop volumineux. Maximum autorisé : 5MB",
          requiredFields: "Remplissez tous les champs obligatoires"
        }
      },
      profile: {
        title: "Profil",
        roles: {
          admin: "Administrateur",
          user: "Utilisateur",
          superv: "Superviseur"
        },
        buttons: {
          edit: "Modifier le profil"
        },
        stats: {
          openTickets: "Tickets ouverts",
          closedToday: "Fermé Aujourd'hui",
          averageResponseTime: "Temps de Réponse Moyen",
          rating: "Évaluation"
        },
        fields: {
          name: "Nom",
          email: "E-mail",
          workHours: "Heures de Travail"
        }
      },
      queueIntegrationModal: {
        title: {
          add: "Ajouter un projet",
          edit: "Modifier le projet"
        },
        form: {
          id: "ID",
          type: "Type",
          name: "Nom",
          projectName: "Nom du Projet",
          language: "Langue",
          jsonContent: "Contenu Json",
          urlN8N: "URL",
          n8nApiKey: "Clé API de n8n",
          OpenApiKey: "Clé API d'OpenAI",
          typebotSlug: "Typebot - Slug",
          selectFlow: "Nom du Flux",
          typebotExpires: "Temps en minutes pour expirer une conversation",
          typebotKeywordFinish: "Mot pour clôturer le ticket",
          typebotKeywordRestart: "Mot pour redémarrer le flux",
          typebotRestartMessage: "Message lors du redémarrage de la conversation",
          typebotUnknownMessage: "Message d'option invalide",
          typebotDelayMessage: "Intervalle (ms) entre les messages"
        },
        buttons: {
          okAdd: "Enregistrer",
          okEdit: "Enregistrer",
          cancel: "Annuler",
          test: "Tester le Bot"
        },
        messages: {
          testSuccess: "Intégration testée avec succès!",
          addSuccess: "Intégration ajoutée avec succès.",
          editSuccess: "Intégration modifiée avec succès."
        }
      },
      promptModal: {
        form: {
          name: "Nom",
          prompt: "Invite",
          voice: "Voix",
          max_tokens: "Nombre maximum de jetons dans la réponse",
          temperature: "Température",
          apikey: "Clé API",
          max_messages: "Nombre maximum de messages dans l'historique",
          voiceKey: "Clé de l'API vocale",
          voiceRegion: "Région vocale"
        },
        success: "Invite enregistrée avec succès!",
        title: {
          add: "Ajouter une Invite",
          edit: "Modifier l'Invite"
        },
        buttons: {
          okAdd: "Enregistrer",
          okEdit: "Enregistrer",
          cancel: "Annuler"
        }
      },
      prompts: {
        title: "Invites",
        noDataFound: "Oups, rien ici!",
        noDataFoundMessage: "Aucune invite n'a été trouvée. Ne vous inquiétez pas, vous pouvez en créer une première! Cliquez sur le bouton ci-dessous pour commencer.",
        table: {
          name: "Nom",
          queue: "Secteur",
          max_tokens: "Nombre maximal de jetons de réponse",
          actions: "Actions"
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Êtes-vous sûr? Cette action ne peut pas être annulée!"
        },
        buttons: {
          add: "Créer une invite"
        }
      },
      contactsImport: {
        notifications: {
          started: "Importation commencée! Vous serez notifié de la progression.",
          error: "Erreur lors du démarrage de l'importation. Veuillez réessayer.",
          noFile: "Sélectionnez un fichier CSV à importer",
          progress: "Importation en cours: {percentage}% terminée",
          complete: "Importation terminée! {validCount} contacts importés avec succès. {invalidCount} contacts invalides.",
          importError: "Erreur lors de l'importation: {message}"
        },
        instructions: {
          title: "Pour importer des contacts, veuillez suivre les instructions ci-dessous:",
          csvFormat: "Le fichier à importer doit être au format .CSV.",
          numberFormat: "Les numéros de WhatsApp doivent être saisis sans espaces et séparés par des points-virgules (;).",
          exampleTitle: "Exemple de remplissage du tableau."
        }
      },
      contacts: {
        title: "Gestion des contacts",
        subtitle: "de",
        searchPlaceholder: "Rechercher des contacts...",
        emptyMessage: "Aucun contact trouvé",
        noContactsFound: "Aucun contact trouvé",
        noContactsFoundMessage: "Aucun contact enregistré pour le moment.",
        addContactMessage: "Ajoutez un nouveau contact pour commencer!",
        import: {
          title: "Importer des contacts",
          steps: {
            selectFile: "Sélectionner un fichier",
            mapFields: "Mapper les champs",
            review: "Réviser",
            result: "Résultat"
          },
          mapFields: "Mapping des champs",
          selectFilePrompt: "Sélectionnez un fichier CSV ou Excel pour importer des contacts",
          dragAndDrop: "Faites glisser et déposez votre fichier ici",
          or: "ou",
          browse: "Rechercher",
          supportedFormats: "Formats pris en charge: CSV, XLS, XLSX",
          needTemplate: "Besoin d'un modèle?",
          downloadTemplate: "Télécharger le modèle",
          processingFile: "Traitement du fichier en cours...",
          mapFieldsInfo: "Sélectionnez quelles colonnes de votre fichier correspondent à chaque champ de contact. Les champs marqués d'une * sont obligatoires.",
          fullContact: "Importer les données complètes (inclure des champs supplémentaires)",
          selectField: "Sélectionnez un champ",
          extraFields: "Champs supplémentaires",
          extraFieldsInfo: "Mappez des champs supplémentaires qui seront importés en tant qu'informations supplémentaires du contact.",
          noExtraFields: "Aucun champ supplémentaire mappé.",
          addExtraField: "Ajouter un champ supplémentaire",
          extraFieldName: "Nom du champ supplémentaire",
          value: "Valeur",
          validationErrors: "{{count}} erreurs de validation ont été trouvées",
          errorDetails: "{{count}} enregistrements avec des problèmes",
          rowError: "Ligne {{row}}: {{error}}",
          moreErrors: "...et {{count}} erreurs supplémentaires",
          validation: {
            nameRequired: "Le champ Nom est obligatoire",
            numberRequired: "Le champ Numéro est obligatoire",
            emptyName: "Nom vide",
            emptyNumber: "Numéro vide",
            invalidNumberFormat: "Format de numéro invalide",
            invalidEmail: "Email invalide",
            companyNotFound: "Société \"{{company}}\" non trouvée, sera créée automatiquement",
            positionNotFound: "Poste \"{{position}}\" non trouvé, sera créé automatiquement",
            dataErrors: "{{count}} enregistrements contiennent des erreurs"
          },
          reviewAndImport: "Réviser et importer",
          reviewInfo: "Vérifiez que les données sont correctes avant de commencer l'importation.",
          summary: "Résumé",
          totalRecords: "Total des enregistrements",
          validRecords: "Enregistrements valides",
          invalidRecords: "Enregistrements avec avertissements",
          importMode: "Mode d'importation",
          fullContactMode: "Inscription complète",
          basicContactMode: "Inscription de base",
          mappedFields: "Champs mappés",
          notMapped: "Non mappé",
          extraField: "Champ supplémentaire",
          previewData: "Visualisation des données",
          showingFirst: "Affichage des premiers {{count}} sur un total de {{total}} enregistrements",
          importingContacts: "Importation des contacts en cours...",
          pleaseWait: "Veuillez patienter. Cela peut prendre quelques minutes.",
          importComplete: "Importation terminée",
          importFailed: "Échec de l'importation",
          totalProcessed: "Total traité",
          successful: "Succès",
          failed: "Échecs",
          errors: {
            invalidFileType: "Type de fichier invalide",
            emptyFile: "Fichier vide",
            parsingFailed: "Échec du traitement du fichier",
            readFailed: "Échec de lecture du fichier",
            processingFailed: "Échec du traitement du fichier",
            fetchEmployersFailed: "Erreur lors de la recherche des employeurs",
            fetchPositionsFailed: "Erreur lors de la recherche des postes",
            validationFailed: "Validation échouée. Corrigez les erreurs avant de continuer.",
            importFailed: "Échec de l'importation",
            generalError: "Erreur générale lors de l'importation",
            timeout: "Temps d'importation dépassé",
            statusCheckFailed: "Échec de vérification du statut de l'importation",
            templateGenerationFailed: "Échec de génération du modèle"
          },
          successMessage: "{{count}} contacts ont été importés avec succès.",
          failureMessage: "Aucun contact n'a été importé. Vérifiez les erreurs et réessayez.",
          importAnother: "Importer plus de contacts",
          import: "Importer"
        },
        table: {
          id: "ID",
          name: "Nom",
          number: "Numéro",
          email: "E-mail",
          company: "Entreprise",
          tags: "Tags",
          bot: "Bot",
          actions: "Actions",
          whatsapp: "WhatsApp",
          groupId: "ID du groupe",
          botEnabled: "Bot activé",
          botDisabled: "Bot désactivé",
          disableBot: "Statut du bot",
          noTags: "Pas de tags"
        },
        buttons: {
          add: "Ajouter un contact",
          addContact: "Ajouter un contact",
          edit: "Modifier le contact",
          delete: "Supprimer le contact",
          deleteAll: "Tout supprimer",
          addOrDelete: "Gérer",
          import: "Importer",
          export: "Exporter",
          importExport: "Importer/Exporter",
          startChat: "Commencer une conversation",
          block: "Bloquer le contact",
          unblock: "Débloquer le contact",
          manage: "Options"
        },
        bulkActions: {
          selectedContacts: "{{count}} contacts sélectionnés",
          actions: "Actions de masse",
          enableBot: "Activer le bot",
          disableBot: "Désactiver le bot",
          block: "Bloquer",
          unblock: "Débloquer",
          delete: "Supprimer"
        },
        confirmationModal: {
          deleteTitleNoHasContactCreated: "Aucun contact enregistré",
          deleteTitleNoHasContactCreatedMessage: "Vous n'avez pas encore de contacts enregistrés. Cliquez sur 'Ajouter' pour créer un nouveau contact.",
          deleteTitle: "Supprimer le contact",
          deleteMessage: "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce contact ?",
          deleteAllTitle: "Supprimer tous les contacts",
          deleteAllMessage: "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer tous les contacts ?",
          blockTitle: "Bloquer le contact",
          blockMessage: "En bloquant ce contact, vous ne pourrez plus lui envoyer ni recevoir de messages.",
          unblockTitle: "Débloquer le contact",
          unblockMessage: "En débloquant ce contact, vous pourrez à nouveau recevoir ses messages.",
          bulkEnableBotTitle: "Activer le bot pour les contacts sélectionnés",
          bulkEnableBotMessage: "Êtes-vous sûr de vouloir activer le bot pour tous les contacts sélectionnés ?",
          bulkDisableBotTitle: "Désactiver le bot pour les contacts sélectionnés",
          bulkDisableBotMessage: "Êtes-vous sûr de vouloir désactiver le bot pour tous les contacts sélectionnés ?",
          bulkBlockTitle: "Bloquer les contacts sélectionnés",
          bulkBlockMessage: "Êtes-vous sûr de vouloir bloquer tous les contacts sélectionnés ? Vous ne pourrez plus leur envoyer ni recevoir de messages.",
          bulkUnblockTitle: "Débloquer les contacts sélectionnés",
          bulkUnblockMessage: "Êtes-vous sûr de vouloir débloquer tous les contacts sélectionnés ? Vous pourrez à nouveau recevoir leurs messages.",
          bulkDeleteTitle: "Supprimer les contacts sélectionnés",
          bulkDeleteMessage: "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer tous les contacts sélectionnés?",
          genericTitle: "Confirmer l'action",
          genericMessage: "Êtes-vous sûr de vouloir exécuter cette action?"
        },
        toasts: {
          deleted: "Contact supprimé avec succès!",
          deletedAll: "Tous les contacts ont été supprimés avec succès!",
          blocked: "Contact bloqué avec succès!",
          unblocked: "Contact débloqué avec succès!",
          bulkBotEnabled: "Bot activé pour les contacts sélectionnés!",
          bulkBotDisabled: "Bot désactivé pour les contacts sélectionnés!",
          bulkBlocked: "Les contacts sélectionnés ont été bloqués!",
          bulkUnblocked: "Les contacts sélectionnés ont été débloqués!",
          bulkDeleted: "Les contacts sélectionnés ont été supprimés!",
          noContactsSelected: "Aucun contact sélectionné",
          unknownAction: "Action inconnue",
          bulkActionError: "Erreur lors de l'exécution de l'action en masse"
        },
        form: {
          name: "Nom",
          number: "Numéro",
          email: "E-mail",
          company: "Entreprise",
          position: "Poste"
        },
        filters: {
          byTag: "Filtrer par tag",
          selectTags: "Sélectionnez les tags à filtrer",
          noTagsAvailable: "Aucune tag disponible"
        }
      },
      contactModal: {
        title: {
          new: "Nouveau contact",
          edit: "Modifier le contact"
        },
        helpText: "Remplissez les données du contact. Le numéro de téléphone doit être au format : DDI DDD NUMÉRO (Ex: 55 16 996509803)",
        sections: {
          basic: "Informations de base",
          tags: "Tags",
          organization: "Informations organisationnelles",
          additional: "Informations supplémentaires"
        },
        form: {
          name: "Nom",
          number: "Numéro",
          email: "E-mail",
          numberFormat: "Format : DDI DDD NUMÉRO (Ex: 55 16 996509803)",
          numberTooltip: "Utilisez le format : DDI DDD NUMÉRO (Ex: 55 16 996509803)",
          company: "Entreprise",
          position: "Poste",
          selectCompanyFirst: "Sélectionnez d'abord une entreprise",
          positionHelp: "Entrez pour créer un nouveau poste ou sélectionnez-en un existant",
          disableBot: "Désactiver le bot",
          extraName: "Nom du champ",
          extraValue: "Valeur du champ",
          noExtraInfo: "Aucune information supplémentaire. Cliquez sur le bouton ci-dessous pour ajouter."
        },
        buttons: {
          cancel: "Annuler",
          save: "Enregistrer",
          update: "Mettre à jour",
          remove: "Supprimer",
          addExtraInfo: "Ajouter un champ",
          okEdit: "Éditer",
          okAdd: "Ajouter"
        },
        tags: {
          saveFirst: "Les tags peuvent être ajoutées après avoir enregistré le contact."
        },
        success: {
          created: "Contact créé avec succès!",
          updated: "Contact mis à jour avec succès!",
          profilePic: "Photo de profil mise à jour avec succès!"
        },
        warnings: {
          tagsSyncFailed: "Contact enregistré, mais une erreur s'est produite lors de l'ajout des tags"
        },
        errors: {
          loadData: "Erreur lors du chargement des données nécessaires",
          loadCompanies: "Erreur lors du chargement des entreprises",
          saveGeneric: "Erreur lors de l'enregistrement du contact. Vérifiez les données et réessayez."
        }
      },
      contactTagsManager: {
        selectTags: "Sélectionner les tags",
        noTags: "Aucune étiquette attribuée à ce contact",
        success: {
          updated: "Tags mises à jour avec succès!"
        },
        errors: {
          loadTags: "Erreur lors du chargement des tags",
          loadContactTags: "Erreur lors du chargement des tags du contact",
          updateTags: "Erreur lors de la mise à jour des tags"
        }
      },
      newPositionModal: {
        title: "Nouveau poste",
        form: {
          name: "Nom"
        },
        buttons: {
          cancel: "Annuler",
          save: "Enregistrer"
        },
        validation: {
          required: "Le champ Nom est obligatoire."
        },
        success: "Poste créé avec succès!",
        error: "Erreur lors de la création du poste. Veuillez réessayer plus tard."
      },
      employerModal: {
        title: "Nouvelle entreprise",
        success: "Entreprise enregistrée avec succès",
        form: {
          name: "Nom de l'entreprise"
        }
      },
      userModal: {
        title: {
          add: "Ajouter un utilisateur",
          edit: "Modifier l'utilisateur"
        },
        tabs: {
          info: "Informations",
          permission: "Autorisations",
          notifications: "Notifications"
        },
        form: {
          name: "Nom",
          email: "E-mail",
          password: "Mot de passe",
          profileT: "Profil",
          profile: {
            admin: "Administrateur",
            user: "Utilisateur",
            superv: "Superviseur"
          },
          profileHelp: "Définit le niveau d'accès de l'utilisateur dans le système",
          ramal: "Poste",
          startWork: "Début de la journée de travail",
          endWork: "Fin de la journée de travail",
          workHoursHelp: "Définit les horaires de travail de l'utilisateur",
          super: "Super utilisateur",
          superHelp: "Permet un accès total au système",
          allTicket: "Voir tous les tickets",
          allTicketHelp: "Permet de visualiser tous les tickets, y compris ceux sans secteur",
          spy: "Espionner les conversations",
          spyHelp: "Permet d'espionner les conversations en cours",
          isTricked: "Voir la liste des contacts",
          isTrickedHelp: "Permet de visualiser la liste des contacts",
          defaultMenu: "Menu Standard",
          defaultMenuHelp: "Définit l'état initial du menu latéral",
          defaultMenuOpen: "Ouvert",
          defaultMenuClosed: "Fermé",
          color: "Couleur de l'utilisateur",
          colorHelp: "Couleur d'identification de l'utilisateur dans le système",
          whatsapp: "Connexion Standard",
          whatsappHelp: "Connexion standard à laquelle l'utilisateur répondra",
          whatsappNone: "Aucun",
          number: "Numéro de WhatsApp",
          numberHelp: "Numéro qui recevra les notifications (avec DDD)",
          notificationSettings: "Paramètres de notification via WhatsApp",
          notificationTypes: "Types de notification",
          notifyNewTicket: "Notification de Nouvelle Assistance",
          notifyNewTicketHelp: "Envoie une notification sur WhatsApp lorsqu'il y a un nouvel appel dans les files d'attente de cet utilisateur",
          notifyTask: "Notification de Tâches",
          notifyTaskHelp: "Envoie une notification sur WhatsApp concernant les nouvelles tâches ou les tâches en retard attribuées à cet utilisateur",
          onlyAdminSupervHelp: "Seuls les administrateurs et les superviseurs peuvent modifier les paramètres de notification.",
          profilePicHelp: "Cliquez sur l'image pour modifier",
          canRestartConnections: "Redémarrer les connexions",
          canRestartConnectionsHelp: "Permet à l'utilisateur de redémarrer les connexions WhatsApp"
        },
        buttons: {
          cancel: "Annuler",
          okAdd: "Ajouter",
          okEdit: "Enregistrer"
        },
        success: "Utilisateur enregistré avec succès!",
        errors: {
          load: "Erreur lors du chargement de l'utilisateur",
          save: "Erreur lors de l'enregistrement de l'utilisateur"
        }
      },
      scheduleModal: {
        title: {
          add: "Nouvelle Planification",
          edit: "Modifier la Planification"
        },
        form: {
          body: "Message",
          contact: "Contact",
          sendAt: "Date de Planification",
          sentAt: "Date d'Envoi"
        },
        buttons: {
          okAdd: "Ajouter",
          okEdit: "Enregistrer",
          cancel: "Annuler"
        },
        success: "Planification enregistrée avec succès."
      },
      chat: {
        title: "Chat interne",
        conversations: "Conversations",
        chatList: "Liste des Conversations",
        messages: "Messages",
        recentMessages: "Messages Récents",
        selectChat: "Sélectionnez une conversation",
        selectChatMessage: "Choisissez une conversation pour commencer à interagir",
        newChat: "Nouvelle Conversation",
        editChat: "Modifier la Conversation",
        deleteChat: "Supprimer la Conversation",
        delete: "Supprimer la Conversation",
        createGroup: "Créer un groupe",
        leaveGroup: "Quitter le groupe",
        chatTitle: "Titre de la conversation",
        selectUsers: "Sélectionner des participants",
        searchUsers: "Rechercher des utilisateurs...",
        selectedUsers: "Participants sélectionnés",
        create: "Créer",
        saveChanges: "Enregistrer les modifications",
        cancel: "Annuler",
        titleRequired: "Le titre est obligatoire",
        titleMinLength: "Le titre doit contenir au moins 3 caractères",
        titleMaxLength: "Le titre doit contenir au maximum 50 caractères",
        usersRequired: "Sélectionnez au moins un participant",
        sendMessage: "Envoyer un message",
        typeMessage: "Tapez votre message...",
        messagePlaceholder: "Écrire un message",
        noMessages: "Aucun message pour le moment",
        loadingMessages: "Chargement des messages...",
        loadMore: "Charger plus",
        messageDeleted: "Message supprimé",
        attachFile: "Joindre un fichier",
        uploadImage: "Envoyer une image",
        uploadVideo: "Envoyer une vidéo",
        recordAudio: "Enregistrer un audio",
        stopRecording: "Arrêter l'enregistrement",
        preview: "Prévisualisation",
        send: "Envoyer",
        downloading: "Téléchargement...",
        uploading: "Envoi...",
        copyMessage: "Copier le message",
        deleteMessage: "Supprimer le message",
        editMessage: "Modifier le message",
        quoteMessage: "Répondre",
        typing: "en train d'écrire...",
        online: "En ligne",
        offline: "Hors ligne",
        lastSeen: "Vu pour la dernière fois",
        recording: "Enregistrement en cours...",
        deleteConfirmTitle: "Supprimer la Conversation",
        deleteConfirmMessage: "Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.",
        leaveConfirmTitle: "Quitter le groupe",
        leaveConfirmMessage: "Êtes-vous sûr de vouloir quitter ce groupe ?",
        blockUser: "Bloquer l'utilisateur",
        unblockUser: "Débloquer l'utilisateur",
        reportUser: "Signaler l'utilisateur",
        blockUserConfirm: "Confirmer le blocage",
        blockUserMessage: "Êtes-vous sûr de vouloir bloquer cet utilisateur ?",
        reportUserTitle: "Signaler l'utilisateur",
        reportPlaceholder: "Décrivez le motif de la plainte",
        userBlocked: "Utilisateur bloqué",
        userUnblocked: "Utilisateur débloqué",
        reportSent: "Signalement envoyé",
        exportChat: "Exporter la conversation",
        exportPdf: "Exporter en PDF",
        exportSuccess: "Conversation exportée avec succès",
        viewMode: "Mode d'affichage",
        listView: "Affichage en liste",
        gridView: "Affichage en grille",
        tooltips: {
          sendButton: "Envoyer un message",
          attachButton: "Joindre un fichier",
          recordButton: "Enregistrer un audio",
          emojiButton: "Insérer un emoji",
          blockButton: "Bloquer l'utilisateur",
          reportButton: "Signaler l'utilisateur",
          exportButton: "Exporter la conversation",
          editButton: "Modifier la conversation",
          deleteButton: "Supprimer la conversation",
          searchButton: "Rechercher dans les messages",
          viewModeButton: "Basculer le mode d'affichage"
        },
        errors: {
          loadError: "Erreur lors du chargement des conversations",
          loadMessagesError: "Erreur lors du chargement des messages",
          sendError: "Erreur lors de l'envoi du message",
          uploadError: "Erreur lors de l'envoi du fichier",
          recordingError: "Erreur lors de l'enregistrement audio",
          deleteError: "Erreur lors de la suppression de la conversation",
          createError: "Erreur lors de la création de la conversation",
          editError: "Erreur lors de la modification de la conversation",
          blockError: "Erreur lors du blocage de l'utilisateur",
          reportError: "Erreur lors de l'envoi du signalement",
          exportError: "Erreur lors de l'exportation de la conversation",
          loadUsersError: "Erreur lors du chargement des utilisateurs",
          searchError: "Erreur lors de la recherche d'utilisateurs",
          saveError: "Erreur lors de l'enregistrement de la conversation"
        },
        success: {
          messageSent: "Message envoyé",
          conversationCreated: "Conversation créée avec succès",
          conversationUpdated: "Conversation mise à jour avec succès",
          conversationDeleted: "Conversation supprimée avec succès",
          userBlocked: "Utilisateur bloqué avec succès",
          userUnblocked: "Utilisateur débloqué avec succès",
          reportSent: "Signalement envoyé avec succès",
          chatExported: "Conversation exportée avec succès",
          createSuccess: "Conversation créée avec succès",
          editSuccess: "Conversation mise à jour avec succès"
        },
        empty: {
          noChats: "Aucune conversation trouvée",
          noMessages: "Aucun message trouvé",
          noResults: "Aucun résultat trouvé",
          startConversation: "Commencez une nouvelle conversation !",
          noConversations: "Vous n'avez pas encore de conversations"
        },
        search: {
          searchChats: "Rechercher des conversations",
          searchMessages: "Rechercher des messages",
          searchUsers: "Rechercher des utilisateurs",
          noResults: "Aucun résultat trouvé",
          searching: "Recherche en cours..."
        }
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nouveau",
          newGroup: "Nouveau groupe"
        }
      },
      ticketsQueueSelect: {
        placeholder: "Secteurs"
      },
      tickets: {
        inbox: {
          closeAll: "Fermer tous les tickets",
          confirmCloseTitle: "Fermer les tickets",
          confirmCloseConnectionMessage: "Voulez-vous fermer tous les tickets de la connexion {{connection}}?",
          confirmCloseAllMessage: "Voulez-vous fermer tous les tickets de toutes les connexions?",
          confirm: "Confirmer",
          cancel: "Annuler",
          yes: "OUI",
          no: "NON",
          closedAllTickets: "Voulez-vous fermer tous les tickets?",
          newTicket: "Nouveau ticket",
          open: "Ouverts",
          resolverd: "Résolus",
          ticketDeleteSuccessfully: "Ticket supprimé avec succès."
        },
        toasts: {
          deleted: "Le service auquel vous participiez a été supprimé."
        },
        notification: {
          message: "Message de"
        },
        tabs: {
          open: {
            title: "Ouverts"
          },
          group: {
            title: "Groupes"
          },
          private: {
            title: "Privés"
          },
          closed: {
            title: "Résolus"
          },
          search: {
            title: "Recherche"
          }
        },
        search: {
          filterConnections: "Connexion",
          ticketsPerPage: "Tickets par page",
          placeholder: "Rechercher des services et des messages",
          filterConectionsOptions: {
            open: "Ouvert",
            closed: "Fermé",
            pending: "En attente",
            group: "Groupes"
          }
        },
        connections: {
          allConnections: "Toutes les connexions"
        },
        buttons: {
          showAll: "Tous",
          refresh: "Mettre à jour"
        }
      },
      statistics: {
        title: "Statistiques",
        startDate: "Date de début",
        endDate: "Date de fin",
        stateFilter: "Filtrer par état",
        dddFilter: "Filtrer par DDD",
        allStates: "Tous les états",
        selectDDDs: "Sélectionner les DDD",
        buttons: {
          generate: "Générer un rapport"
        },
        fetchSuccess: "Statistiques chargées avec succès",
        fetchError: "Erreur lors du chargement des statistiques",
        cards: {
          totalAttendances: "Total des assistances",
          openTickets: "Tickets ouverts",
          averageResponseTime: "Temps de Réponse Moyen",
          newContacts: "Nouveaux contacts",
          stateContacts: "Contacts dans l'État",
          stateContactsBreakdown: "{{dddCount}} sur {{stateTotal}} contacts à {{state}}"
        },
        charts: {
          ticketsEvolution: "Évolution des tickets",
          ticketsChannels: "Canaux de tickets",
          brazilMap: "Carte des contacts par État"
        }
      },
      transferTicketModal: {
        title: "Transférer le ticket",
        fieldLabel: "Tapez pour rechercher des utilisateurs",
        comments: "Commentaires",
        fieldQueueLabel: "Transférer à un département",
        fieldQueuePlaceholder: "Sélectionnez un secteur",
        noOptions: "Aucun utilisateur trouvé avec ce nom",
        fieldConnectionSelect: "Sélectionnez une connexion",
        buttons: {
          ok: "Transférer",
          cancel: "Annuler"
        }
      },
      ticketsList: {
        pendingHeader: "En attente",
        assignedHeader: "En cours",
        noTicketsTitle: "Rien ici!",
        noTicketsMessage: "Aucun traitement trouvé avec ce statut ou terme recherché",
        tagModalTitle: "Tags du ticket",
        noTagsAvailable: "Aucune tag disponible",
        buttons: {
          exportAsPdf: "Exporter en PDF",
          accept: "Accepter",
          closed: "Terminer",
          reopen: "Rouvrir",
          close: "Fermer"
        }
      },
      newTicketModal: {
        statusConnected: "CONNECTÉ",
        statusDeconnected: "DÉCONNECTÉ",
        connectionDefault: "Modèle",
        title: "Créer un ticket",
        fieldLabel: "Tapez pour rechercher le contact",
        add: "Ajouter",
        buttons: {
          ok: "Enregistrer",
          cancel: "Annuler"
        },
        queue: "Sélectionnez un secteur",
        conn: "Sélectionnez une connexion"
      },
      ticketdetails: {
        iconspy: "Espionner la conversation",
        iconacept: "Accepter la conversation",
        iconreturn: "Retourner au département",
        iconstatus: "SANS DÉPARTEMENT"
      },
      SendContactModal: {
        title: "Envoyer le(s) contact(s)",
        fieldLabel: "Tapez pour rechercher",
        selectedContacts: "Contacts sélectionnés",
        add: "Créer un nouveau contact",
        buttons: {
          newContact: "Créer un nouveau contact",
          cancel: "annuler",
          ok: "envoyer"
        }
      },
      daysweek: {
        day1: "Lundi",
        day2: "Mardi",
        day3: "Mercredi",
        day4: "Jeudi",
        day5: "Vendredi",
        day6: "Samedi",
        day7: "Dimanche",
        save: "Enregistrer"
      },
      mainDrawer: {
        listTitle: {
          service: "Assistances",
          management: "Gestion",
          administration: "Administration"
        },
        listItems: {
          dashboard: "Tableau de bord",
          statistics: "Statistiques",
          connections: "Connexions",
          groups: "Groupes",
          flowBuilder: "Flux de conversations",
          messageRules: "Règles du ChatBot",
          tickets: "Conversations",
          chatsTempoReal: "Chat en direct",
          tasks: "Tâches",
          quickMessages: "Réponses rapides",
          asaasServices: "Services Asaas",
          contacts: {
            menu: "Contacts",
            list: "Agenda des contacts",
            employers: "Entreprises",
            employerspwd: "Banque de mots de passe",
            positions: "Postes"
          },
          queues: "Secteurs & Chatbot",
          tags: "Tags",
          kanban: "Kanban",
          email: "E-mail",
          users: "Collaborateurs",
          whatsappTemplates: "Modèles Whatsapp",
          settings: "Paramètres",
          helps: "Centre d'aide",
          messagesAPI: "API",
          internalAPI: "API interne",
          schedules: "Rendez-vous",
          campaigns: "Campagnes",
          zabbix: "Painel Zabbix",
          api: "API",
          adminDashboard: "Visão Geral",
          annoucements: "Informatifs",
          chats: "Chat interne",
          financeiro: "Financier",
          files: "Liste des fichiers",
          integrations: {
            menu: "Automatisations"
          },
          prompts: "Invitations OpenAI",
          profiles: "Profils d'accès",
          permissions: "Autorisations",
          assistants: "Agents OpenAI",
          reports: "Rapports",
          queueIntegration: "Intégrations",
          typebot: "Typebot",
          companies: "Entreprises",
          version: "Version",
          exit: "Quitter"
        },
        appBar: {
          notRegister: "Aucune connexion active.",
          greetings: {
            hello: "Bonjour, ",
            tasks: "vous avez {{count}} tâches en attente!",
            one: "Bonjour ",
            two: "Bienvenue à ",
            three: "Actif jusqu'à"
          },
          menu: "Menu",
          tasks: "Tâches",
          notifications: "Notifications",
          volume: "Volume",
          refresh: "Mettre à jour",
          backup: {
            title: "Sauvegarde",
            backup: "Sauvegarder",
            schedule: "Planifier des e-mails"
          },
          user: {
            profile: "Profil",
            darkmode: "Mode sombre",
            lightmode: "Mode clair",
            language: "Langue",
            logout: "Quitter"
          },
          i18n: {
            language: "Français",
            language_short: "FR",
          },
        }
      },
      email: {
        title: {
          sendEmail: "Envoyer un e-mail",
          scheduleEmail: "Planifier un e-mail",
          emailList: "Liste des e-mails"
        },
        fields: {
          sender: "Destinataire",
          subject: "Sujet",
          message: "Message",
          sendAt: "Date d'Envoi",
          attachments: "Pièce(s) jointe(s)"
        },
        placeholders: {
          sender: "email@exemplo.com (separar múltiplos emails por vírgula)",
          subject: "Entrez l'objet de l'e-mail",
          message: "Entrez votre message ici..."
        },
        validations: {
          senderRequired: "Destinataire obligatoire",
          invalidEmails: "Un ou plusieurs e-mails sont invalides",
          subjectRequired: "L'objet est obligatoire",
          messageRequired: "Le message est obligatoire",
          dateInPast: "La date ne peut pas être dans le passé"
        },
        buttons: {
          send: "Envoyer",
          schedule: "Planifier",
          cancel: "Annuler",
          close: "Fermer",
          reschedule: "Replanifier",
          attachFile: "Joindre un fichier",
          showAdvanced: "Options avancées",
          hideAdvanced: "Masquer les options avancées",
          showMore: "Voir plus",
          showLess: "Voir moins",
          removeAttachment: "Supprimer la pièce jointe"
        },
        tabs: {
          send: "Envoyer",
          schedule: "Planifier",
          list: "Lister",
          sent: "Envoyés",
          scheduled: "Planifiés"
        },
        status: {
          sent: "Envoyé",
          pending: "En attente",
          error: "Erreur",
          unknown: "Inconnu"
        },
        errors: {
          loadEmails: "Erreur lors du chargement des emails",
          apiError: "Erreur dans l'API",
          cancelError: "Erreur lors de l'annulation de l'email",
          rescheduleError: "Erreur lors de la reprogrammation de l'email",
          exportError: "Erreur lors de l'exportation des emails"
        },
        helperTexts: {
          recipientCount: "{count} destinataire(s)",
          attachmentCount: "{count} fichier(s) sélectionné(s)",
          sendAt: "Choisissez une date et une heure futures pour l'envoi"
        },
        tooltips: {
          sender: "Entrez un ou plusieurs emails séparés par des virgules",
          subject: "Entrez un objet informatif",
          message: "Écrivez votre message",
          sendAt: "Choisissez quand l'email sera envoyé",
          refresh: "Mettre à jour",
          export: "Exporter",
          viewEmail: "Voir l'email",
          moreOptions: "Plus d'options"
        },
        dueDateNotification: {
          title: "Envois de notifications de facture",
          error: "Une erreur s'est produite lors de l'envoi des notifications",
          close: "Fermer"
        },
        filters: {
          all: "Tous",
          sent: "Envoyés",
          pending: "En attente",
          error: "Erreurs"
        },
        search: {
          placeholder: "Rechercher des emails..."
        },
        noEmails: "Aucun email trouvé",
        noSubject: "(Sans objet)",
        sentAt: "Envoyé le",
        scheduledFor: "Planifié pour",
        days: {
          monday: "Lundi",
          tuesday: "Mardi",
          wednesday: "Mercredi",
          thursday: "Jeudi",
          friday: "Vendredi",
          saturday: "Samedi",
          sunday: "Dimanche"
        },
        chart: {
          title: "Statistiques d'envoi",
          lineChart: "Graphique en ligne",
          barChart: "Graphique à barres",
          pieChart: "Graphique circulaire",
          sentEmails: "Emails envoyés",
          count: "Quantité",
          emails: "email(s)"
        },
        stats: {
          totalSent: "Total envoyés",
          totalScheduled: "Total planifiés",
          successRate: "Taux de réussite",
          averagePerDay: "Moyenne par jour",
          delivered: "livré(s)",
          pending: "en attente(s)",
          failed: "échec(s)",
          last30Days: "30 derniers jours"
        },
        table: {
          subject: "Sujet",
          recipient: "Destinataire",
          sentAt: "Envoyé le",
          scheduledFor: "Planifié pour",
          status: "Statut",
          actions: "Actions"
        },
        emailDetails: {
          title: "Détails de l'email",
          overview: "Vue d'ensemble",
          content: "Contenu",
          technical: "Technique",
          subject: "Sujet",
          recipient: "Destinataire",
          sentAt: "Envoyé le",
          scheduledFor: "Planifié pour",
          createdAt: "Créé le",
          updatedAt: "Mis à jour le",
          error: "Erreur",
          message: "Message",
          attachments: "Pièces jointes",
          attachmentsPlaceholder: "Aperçu des pièces jointes non disponible",
          emailId: "ID de l'email",
          companyId: "ID de l'entreprise",
          messageId: "ID du message",
          hasAttachments: "Avec pièces jointes",
          scheduled: "Planifié"
        },
        ariaLabels: {
          dashboard: "Panneau d'email",
          tabs: "Onglets d'email",
          sendTab: "Onglet Envoyer un email",
          scheduleTab: "Onglet Planifier un email",
          listTab: "Onglet Liste des emails",
          removeAttachment: "Supprimer la pièce jointe",
          sender: "Champ Destinataire",
          subject: "Champ Objet",
          message: "Champ Message",
          sendAt: "Champ Date d'envoi",
          viewEmail: "Voir l'email",
          moreOptions: "Plus d'options",
          emailLists: "Listes d'email",
          closeDetails: "Fermer les détails",
          detailTabs: "Onglets de détails",
          overviewTab: "Onglet Vue d'ensemble",
          contentTab: "Onglet Contenu",
          technicalTab: "Onglet Technique"
        }
      },
      success: {
        emailSent: "Email envoyé avec succès!",
        emailScheduled: "Email programmé avec succès!",
        emailCancelled: "Rendez-vous annulé avec succès!",
        emailRescheduled: "Email reprogrammé avec succès!"
      },
      todoList: {
        title: "Mes tâches",
        tasksCompleted: "{{completed}} sur {{total}} tâches complétées",
        searchPlaceholder: "Rechercher des tâches...",
        noCategory: "Sans catégorie",
        menu: {
          markAsDone: "Marquer comme terminée",
          pin: "Épingler",
          select: "Sélectionner",
          taskDetails: "Détails de la tâche",
          readAloud: "Lire à haute voix",
          share: "Partager",
          edit: "Éditer",
          duplicate: "Dupliquer",
          delete: "Supprimer"
        },
        success: {
          taskAdded: "Tâche ajoutée avec succès!",
          taskUpdated: "Tâche mise à jour avec succès!",
          taskDeleted: "Tâche supprimée avec succès!",
          taskStatusUpdated: "Statut de la tâche mis à jour avec succès!",
          categoryAdded: "Catégorie ajoutée avec succès!",
          categoryUpdated: "Catégorie mise à jour avec succès!",
          categoryDeleted: "Catégorie supprimée avec succès!"
        },
        errors: {
          fetchTasks: "Erreur lors de la recherche des tâches. Veuillez réessayer.",
          fetchCategories: "Erreur lors de la recherche des catégories. Veuillez réessayer.",
          addTask: "Erreur lors de l'ajout de la tâche. Veuillez réessayer.",
          updateTask: "Erreur lors de la mise à jour de la tâche. Veuillez réessayer.",
          deleteTask: "Erreur lors de la suppression de la tâche. Veuillez réessayer.",
          updateTaskStatus: "Erreur lors de la mise à jour du statut de la tâche. Veuillez réessayer.",
          addCategory: "Erreur lors de l'ajout de la catégorie. Veuillez réessayer.",
          updateCategory: "Erreur lors de la mise à jour de la catégorie. Veuillez réessayer.",
          deleteCategory: "Erreur lors de la suppression de la catégorie. Veuillez réessayer."
        },
        modal: {
          addTask: "Ajouter une tâche",
          editTask: "Modifier la tâche",
          addCategory: "Ajouter une catégorie",
          editCategory: "Modifier la catégorie",
          title: "Titre",
          description: "Description",
          category: "Catégorie",
          dueDate: "Date d'échéance",
          save: "Enregistrer",
          cancel: "Annuler"
        }
      },
      taskCharges: {
        chargesManagement: "Gestion des facturations",
        pendingCharges: "Factures en attente",
        paidCharges: "Factures payées",
        client: "Client",
        allClients: "Tous les clients",
        startDate: "Date de début",
        endDate: "Date de fin",
        task: "Tâche",
        value: "Valeur",
        dueDate: "Échéance",
        employer: "Entreprise",
        chargesByEmployer: "Facturation par Entreprises",
        noEmployerWarning: "Cette tâche n'a pas d'entreprise attribuée.",
        paymentDate: "Date de paiement",
        actions: "Actions",
        noPendingCharges: "Pas de factures en attente",
        noPaidCharges: "Pas de factures payées",
        noClient: "Client non informé",
        noDueDate: "Pas de date d'échéance",
        generatePDF: "Générer PDF",
        sendEmail: "Envoyer par Email",
        registerPayment: "Enregistrer le Paiement",
        pdfGenerated: "PDF généré avec succès",
        emailSent: "Email envoyé avec succès",
        paymentRegistered: "Paiement enregistré avec succès",
        errorLoadingCharges: "Erreur lors du chargement des factures",
        errorGeneratingPDF: "Erreur lors de la génération du PDF",
        errorSendingEmail: "Erreur lors de l'envoi de l'email",
        errorRegisteringPayment: "Erreur lors de l'enregistrement du paiement",
        rowsPerPage: "Éléments par page",
        of: "de",
        financialReport: "Rapport Financier",
        report: "Rapport",
        totalValue: "Montant Total",
        pendingValue: "Montant en Attente",
        paidValue: "Montant Reçu",
        paidInPeriod: "Reçu sur la Période",
        charges: "factures",
        chargesByClient: "Factures par Client",
        chargesByMonth: "Factures par Mois",
        paymentsVsCharges: "Factures vs. Paiements",
        payments: "Paiements",
        noDataAvailable: "Pas de données disponibles",
        selectFiltersAndSearch: "Sélectionnez les filtres et cliquez sur Rechercher",
        errorLoadingReport: "Erreur lors du chargement du rapport",
        paymentNotes: "Remarques sur le Paiement",
        paymentNotesPlaceholder: "Indiquez des détails supplémentaires sur le paiement (optionnel)",
        sendReceipt: "Envoyer le reçu par email",
        title: "Informations de Facturation",
        addChargeDescription: "Ajoutez une facture à cette tâche. Une fois ajoutée, vous pourrez générer des PDF, envoyer par email et enregistrer des paiements.",
        addCharge: "Ajouter une Facture",
        noClientWarning: "Attention : Cette tâche n'a pas de client associé. Considérez ajouter un client pour faciliter la gestion de la facturation.",
        status: "Situation",
        paid: "Payé",
        pending: "En attente",
        notes: "Remarques",
        invalidValue: "Montant invalide. Veuillez saisir une valeur supérieure à zéro.",
        chargeAdded: "Facture ajoutée avec succès",
        errorAddingCharge: "Erreur lors de l'ajout de la facturation",
        noEmailWarning: "Aucun e-mail de contact pour l'envoi. Ajoutez un e-mail au client ou au demandeur."
      },
      taskSubjects: {
        manageSubjects: "Gérer les sujets",
        subjectName: "Sujet",
        subjectDescription: "Description",
        subjectsList: "Sujets existants",
        noSubjects: "Aucun sujet enregistré",
        errorLoading: "Une erreur s'est produite lors du chargement des sujets"
      },
      tasks: {
        title: "Tâches",
        search: "Rechercher",
        from: "De",
        to: "À",
        startDate: "Date de début",
        endDate: "Date de fin",
        dueDate: "Date d'échéance",
        creator: "Créateur",
        responsible: "Responsable",
        category: "Catégorie",
        subject: "Sujet",
        allUsers: "Tous",
        allCategories: "Toutes",
        allStatuses: "Tous",
        allEmployers: "Toutes les entreprises",
        allOptions: "Toutes",
        status: {
          title: "Statut",
          pending: "En attente",
          inProgress: "En cours",
          completed: "Terminée",
          overdue: "En retard"
        },
        privateTask: "Tâche privée (vous seul pouvez voir)",
        private: "Privée",
        public: "Publique",
        paid: "Payé",
        pending: "En attente",
        createdAt: "Créée le",
        lastUpdate: "Dernière mise à jour",
        privacy: "Confidentialité",
        charge: "Facturation",
        recurrence: {
          title: "Récurrence",
          daily: "Quotidienne",
          weekly: "Hebdomadaire",
          biweekly: "Bihebdomadaire",
          monthly: "Mensuel",
          quarterly: "Trimestriel",
          semiannual: "Semestriel",
          annual: "Annuel"
        },
        description: "Description",
        today: "Aujourd'hui",
        tomorrow: "Demain",
        dueToday: "Échéance aujourd'hui",
        dueTomorrow: "Expire demain",
        daysOverdue: "En retard de {{days}} jours",
        dueYesterday: "Expire hier",
        overdueDays: "En retard de {{days}} jours",
        dueInDays: "Expire dans {{days}} jours",
        withAttachments: "Avec pièces jointes",
        employer: "Entreprise",
        employerName: "Nom de l'entreprise",
        employerEmail: "Email de l'entreprise",
        employerPhone: "Téléphone de l'entreprise",
        employerDetails: "Détails de l'entreprise",
        requesterName: "Nom du demandeur",
        requesterEmail: "Email du demandeur",
        requesterDetails: "Détails du demandeur",
        chargeValue: "Montant de la facturation",
        chargeStatus: "Statut du paiement",
        paymentDate: "Date de paiement",
        paymentNotes: "Remarques sur le Paiement",
        paidBy: "Enregistré par",
        viewInvoice: "Voir la facture",
        additionalInfo: "Informations supplémentaires",
        recurrenceType: "Type de récurrence",
        recurrenceDetails: "Détails de la récurrence",
        recurrenceEndDate: "Date de fin",
        recurrenceCount: "Nombre d'occurrences",
        nextOccurrence: "Prochaine occurrence",
        hasNotes: "{{count}} notes",
        hasAttachments: "{{count}} pièces jointes",
        buttons: {
          add: "Ajouter une tâche",
          edit: "Éditer",
          delete: "Supprimer",
          save: "Enregistrer",
          saving: "Enregistrement...",
          cancel: "Annuler",
          close: "Fermer",
          refresh: "Mettre à jour",
          clearFilters: "Effacer les filtres",
          filter: "Filtrer",
          clear: "Effacer les filtres",
          markDone: "Marquer comme terminée",
          markInProgress: "Marquer comme en cours",
          showDeleted: "Afficher les supprimées",
          markPending: "Marquer comme en attente",
          toggleFilters: "Afficher/Masquer les filtres",
          kanbanView: "Vue Kanban",
          listView: "Vue en liste",
          reports: "Rapports",
          finances: "Finances",
          sort: "Trier",
          moreActions: "Plus d'actions",
          options: "Options",
          print: "Imprimer",
          export: "Exporter"
        },
        tabs: {
          all: "Toutes",
          pending: "En attente",
          inProgress: "En cours",
          completed: "Terminé",
          paid: "Facturé",
          unpaid: "En recouvrement",
          recurrent: "Récurrentes",
          notes: "Notes",
          attachments: "Pièces jointes",
          timeline: "Chronologie",
          charges: "Factures",
          details: "Détails",
          deleted: "Supprimé"
        },
        columns: {
          title: "Titre",
          status: "Statut",
          dueDate: "Échéance",
          responsible: "Responsable",
          category: "Catégorie",
          actions: "Actions"
        },
        empty: {
          title: "Aucune tâche trouvée",
          description: "Cliquez sur le bouton ci-dessous pour ajouter une nouvelle tâche",
          noTasks: "Aucune tâche trouvée"
        },
        form: {
          title: "Titre",
          description: "Description",
          dueDate: "Date d'échéance",
          category: "Catégorie",
          assignmentType: "Type d'attribution",
          responsible: "Responsable",
          individual: "Individuel",
          group: "Groupe",
          groupUsers: "Utilisateurs du groupe",
          selectCategory: "Sélectionnez une catégorie",
          selectResponsible: "Sélectionnez un responsable",
          selectField: "Sélectionnez un champ",
          completed: "Terminée",
          titleRequired: "Le titre est obligatoire",
          categoryRequired: "La catégorie est obligatoire",
          userRequired: "Le responsable est obligatoire",
          usersRequired: "Sélectionnez au moins un utilisateur",
          private: "Privée",
          privateInfo: "Vous seul pourrez voir cette tâche",
          employer: "Entreprise",
          subject: "Sujet",
          selectSubject: "Sélectionnez un sujet",
          requesterName: "Nom du demandeur",
          requesterEmail: "Email du demandeur",
          chargeInfo: "Informations de Facturation",
          hasCharge: "Cette tâche a une facturation",
          chargeValue: "Valeur",
          chargeValueRequired: "La valeur de la facturation est obligatoire",
          isPaid: "Facturation effectuée",
          paymentDate: "Date de paiement",
          paymentNotes: "Remarques sur le Paiement",
          recurrenceTitle: "Récurrence",
          recurrenceInfo: "Vous pouvez définir une fin par date ou par nombre d'occurrences. Si les deux sont remplis, ce qui se produit en premier sera considéré.",
          isRecurrent: "Cette tâche est récurrente",
          recurrenceType: "Périodicité",
          recurrenceTypeRequired: "Le type de récurrence est obligatoire",
          recurrenceEndDate: "Date de fin",
          recurrenceCount: "Nombre d'occurrences"
        },
        modal: {
          add: "Ajouter une tâche",
          edit: "Modifier la tâche",
          loadError: "Erreur lors du chargement des données"
        },
        notifications: {
          created: "Tâche créée avec succès",
          updated: "Tâche mise à jour avec succès",
          deleted: "Tâche supprimée avec succès",
          statusUpdated: "Statut mis à jour avec succès",
          titleRequired: "Le titre est obligatoire",
          categoryRequired: "La catégorie est obligatoire",
          userRequired: "Le responsable est obligatoire",
          usersRequired: "Sélectionnez au moins un utilisateur",
          chargeValueRequired: "La valeur de la facturation est obligatoire",
          recurrenceTypeRequired: "Le type de récurrence est obligatoire",
          submitError: "Erreur lors de l'enregistrement de la tâche",
          updateError: "Erreur lors de la mise à jour de la tâche",
          deleteError: "Erreur lors de la suppression de la tâche"
        },
        confirmations: {
          delete: {
            title: "Confirmer la suppression",
            message: "Êtes-vous sûr de vouloir supprimer cette tâche?"
          }
        },
        sort: {
          dueDate: "Date d'échéance",
          title: "Titre",
          category: "Catégorie"
        },
        errors: {
          loadFailed: "Erreur lors du chargement des tâches"
        },
        indicators: {
          notes: "{{count}} notes",
          attachments: "{{count}} pièces jointes",
          paid: "Payé : R$ {{value}}",
          pendingPayment: "En attente : R$ {{value}}",
          recurrent: "Tâche récurrente"
        },
        kanban: {
          statusMode: "Par statut",
          categoryMode: "Par catégorie",
          todo: "À faire",
          inProgress: "En cours",
          done: "Terminé",
          emptyColumn: "Aucune tâche dans cette colonne",
          emptyCategoryColumn: "Aucune tâche dans cette catégorie",
          filters: "Filtres",
          clearFilters: "Effacer les filtres",
          loadError: "Erreur lors du chargement des données du Kanban",
          noCategories: "Aucune catégorie trouvée"
        },
        timeline: {
          system: "Système",
          fetchError: "Erreur lors du chargement de l'historique de la tâche",
          noEvents: "Aucun événement enregistré pour cette tâche",
          taskCreated: "{{name}} a créé la tâche '{{title}}'",
          taskUpdated: "{{name}} a mis à jour la tâche",
          taskDeleted: "{{name}} a supprimé la tâche",
          noteAdded: "{{name}} a ajouté une note",
          noteUpdated: "{{name}} a mis à jour une note",
          noteDeleted: "{{name}} a supprimé une note",
          attachmentAdded: "{{name}} a attaché le fichier '{{filename}}'",
          attachmentDeleted: "{{name}} a supprimé la pièce jointe '{{filename}}'",
          statusCompletedBy: "{{name}} a marqué la tâche comme terminée",
          statusPendingBy: "{{name}} a marqué la tâche comme en attente",
          responsibleChanged: "{{name}} a changé le responsable de {{oldResponsible}} à {{newResponsible}}",
          usersAdded: "{{name}} a ajouté {{count}} utilisateurs à la tâche",
          userRemoved: "{{name}} a supprimé {{removed}} de la tâche",
          categoryChanged: "{{name}} a changé la catégorie pour '{{category}}'",
          dueDateChanged: "{{name}} a changé la date d'échéance pour {{date}}",
          noDate: "sans date",
          titleChanged: "{{name}} a changé le titre pour '{{title}}'",
          descriptionChanged: "{{name}} a mis à jour la description de la tâche",
          employerAssociated: "{{name}} a associé l'entreprise '{{employer}}' à la tâche",
          employerChanged: "{{name}} a changé l'entreprise associée à la tâche",
          subjectAssociated: "{{name}} a associé le sujet '{{subject}}' à la tâche",
          subjectChanged: "{{name}} a changé le sujet de la tâche",
          chargeAdded: "{{name}} a ajouté une facturation de {{value}}",
          paymentRegistered: "{{name}} a enregistré un paiement de {{value}} le {{date}}",
          chargeEmailSent: "{{name}} a envoyé un email de facturation à {{email}}",
          receiptEmailSent: "{{name}} a envoyé un reçu par email à {{email}}",
          chargePdfGenerated: "{{name}} a généré un PDF de la facturation",
          notificationSent: "{{name}} a envoyé une notification via {{type}}",
          notificationFailed: "{{name}} - échec de l'envoi de la notification : {{reason}}",
          overdueNotificationSent: "{{name}} a reçu une notification de retard ({{minutes}} min)",
          recurrenceConfigured: "{{name}} a configuré la récurrence de type {{type}}",
          recurrenceCreated: "{{name}} a créé une nouvelle instance récurrente (#{{childId}})",
          recurrenceChildCreated: "{{name}} a créé une tâche basée sur le modèle #{{parentId}}",
          recurrenceLimitReached: "{{name}} - limite de récurrences atteint ({{count}})",
          recurrenceEndDateReached: "{{name}} - date de fin de récurrence atteinte ({{date}})",
          recurrenceSeriesUpdated: "{{name}} a mis à jour la série de tâches récurrentes ({{fields}})",
          recurrenceSeriesDeleted: "{{name}} a supprimé {{count}} tâches de la série récurrente",
          reportGenerated: "{{name}} a généré un rapport de type {{type}}",
          financialReportGenerated: "{{name}} a généré un rapport financier"
        },
        notes: {
          placeholder: "Ajouter une note...",
          empty: "Aucune note trouvée",
          deleted: "Note supprimée avec succès",
          deleteError: "Erreur lors de la suppression de la note"
        },
        attachments: {
          title: "Pièces jointes",
          dropFiles: "Faites glisser les fichiers ici ou cliquez pour télécharger",
          clickToUpload: "Formats : PDF, JPEG, PNG, DOC, XLS",
          allowedTypes: "Taille maximale : 10 Mo",
          uploading: "Envoi du fichier...",
          uploaded: "Fichier envoyé avec succès",
          deleted: "Fichier supprimé avec succès",
          empty: "Aucune pièce jointe trouvée",
          fileTooLarge: "Le fichier dépasse la taille maximale autorisée ({{size}})",
          fileTypeNotAllowed: "Type de fichier non autorisé",
          errorLoadingFiles: "Erreur lors du chargement des fichiers",
          preview: "Prévisualisation",
          clickToPreview: "Cliquez pour visualiser",
          uploadedBy: "Envoyé par",
          sort: {
            newest: "Plus récents",
            oldest: "Plus anciens",
            nameAsc: "Nom (A-Z)",
            nameDesc: "Nom (Z-A)",
            sizeAsc: "Taille (plus petite en premier)",
            sizeDesc: "Taille (plus grande en premier)"
          }
        },
        reports: {
          title: "Rapports de tâches",
          filters: "Filtres",
          totalTasks: "Total de tâches",
          completed: "Terminé",
          pending: "En attente",
          overdue: "En retard",
          weeklyProgress: "Progression hebdomadaire",
          statusDistribution: "Répartition des statuts",
          userPerformance: "Performance par utilisateur",
          attachmentStats: "Statistiques des pièces jointes",
          noDataAvailable: "Aucune donnée disponible"
        },
        export: {
          success: "Exportation réussie",
          error: "Erreur lors de l'exportation des données",
          downloadTemplate: "Télécharger le modèle",
          noData: "Aucune tâche à exporter"
        },
        import: {
          title: "Importer des tâches",
          steps: {
            selectFile: "Sélectionner un fichier",
            mapFields: "Mapper les champs",
            review: "Réviser",
            result: "Résultat"
          },
          selectFilePrompt: "Sélectionnez un fichier CSV ou Excel avec les tâches à importer",
          dragAndDrop: "Glissez-déposez le fichier ici",
          or: "ou",
          browse: "Rechercher un fichier",
          supportedFormats: "Formats pris en charge : CSV, XLSX, XLS",
          needTemplate: "Besoin d'un modèle pour commencer ?",
          downloadTemplate: "Télécharger le modèle d'importation",
          processingFile: "Traitement du fichier en cours...",
          mapFields: "Mappez les champs de votre fichier aux champs du système",
          mapFieldsInfo: "Sélectionnez quelles colonnes de votre fichier correspondent à chaque champ dans le système. Seul le champ 'Titre' est obligatoire.",
          selectField: "Sélectionnez un champ",
          validation: {
            titleRequired: "Le champ 'Titre' est obligatoire pour l'importation",
            emptyTitle: "Titre vide",
            invalidDate: "Données invalides : {{value}}",
            invalidCategory: "Catégorie '{{category}}' non trouvée",
            invalidUser: "Utilisateur '{{user}}' non trouvé",
            dataErrors: "{{count}} enregistrements avec des problèmes"
          },
          validationErrors: "{{count}} problèmes trouvés dans les données",
          errorDetails: "Détails des erreurs ({{count}})",
          rowError: "Ligne {{row}}: {{error}}",
          moreErrors: "...et {{count}} erreurs supplémentaires",
          reviewAndImport: "Vérifiez les données et lancez l'importation",
          reviewInfo: "Vérifiez les données ci-dessous avant d'importer. Vous pourrez voir un résumé et un échantillon des données qui seront importées.",
          summary: "Résumé",
          totalRecords: "Total des enregistrements",
          validRecords: "Enregistrements valides",
          invalidRecords: "Enregistrements invalides",
          mappedFields: "Champs mappés",
          notMapped: "Non mappé",
          previewData: "Prévisualisation",
          showingFirst: "Affichage des premiers {{count}} sur un total de {{total}} enregistrements",
          import: "Importer",
          importingTasks: "Importation des tâches en cours...",
          pleaseWait: "Veuillez patienter pendant que les tâches sont importées",
          importComplete: "Importation terminée",
          importFailed: "Échec de l'importation",
          totalProcessed: "Total traité",
          successful: "Succès",
          failed: "Échec",
          errors: {
            invalidFileType: "Type de fichier invalide. Utilisez CSV ou Excel.",
            emptyFile: "Fichier vide ou sans données",
            parsingFailed: "Erreur lors du traitement du fichier",
            readFailed: "Erreur lors de la lecture du fichier",
            processingFailed: "Erreur lors du traitement des données",
            validationFailed: "Il y a des erreurs dans la validation des données",
            importFailed: "Échec de l'importation des données",
            generalError: "Erreur inconnue",
            fetchCategoriesFailed: "Erreur lors du chargement des catégories",
            fetchUsersFailed: "Erreur lors du chargement des utilisateurs",
            templateGenerationFailed: "Erreur lors de la génération du modèle"
          },
          successMessage: "{{count}} tâches ont été importées avec succès",
          failureMessage: "L'importation a échoué. Vérifiez les erreurs et réessayez.",
          importAnother: "Importer un autre fichier"
        },
        charges: {
          title: "Gérer les facturations",
          pendingCharges: "Factures en attente",
          paidCharges: "Factures payées",
          employer: "Entreprise",
          allEmployers: "Toutes les entreprises",
          value: "Valeur",
          dueDate: "Date d'échéance",
          paymentDate: "Date de paiement",
          actions: "Actions",
          task: "Tâche",
          status: "Statut",
          generatePDF: "Générer PDF",
          sendEmail: "Envoyer un e-mail",
          registerPayment: "Enregistrer le Paiement",
          addCharge: "Ajouter une Facture",
          addChargeDescription: "Ajoutez une facturation à cette tâche en remplissant la valeur ci-dessous.",
          noEmployerWarning: "Attention : Aucune entreprise définie pour cette tâche. Les facturations sans entreprise peuvent compliquer le suivi.",
          noEmailWarning: "Aucun e-mail de contact pour l'envoi de la facturation.",
          pdfGenerated: "PDF généré avec succès",
          emailSent: "Email envoyé avec succès",
          paymentRegistered: "Paiement enregistré avec succès",
          notes: "Remarques",
          paid: "Payé",
          pending: "En attente",
          invalidValue: "Valeur invalide",
          paymentNotesPlaceholder: "Informations supplémentaires sur le paiement...",
          sendReceipt: "Envoyer le reçu au client",
          noPendingCharges: "Aucune facturation en attente trouvée",
          noPaidCharges: "Aucune facturation payée trouvée",
          noEmployer: "Sans entreprise",
          noDueDate: "Pas de date d'échéance",
          rowsPerPage: "Lignes par page",
          of: "de",
          financialReport: "Rapport Financier",
          report: "Rapport",
          paidInPeriod: "Payé sur la période",
          totalValue: "Montant Total",
          pendingValue: "Montant en Attente",
          paidValue: "Montant payé",
          charges: "factures",
          selectFiltersAndSearch: "Sélectionnez les filtres et cliquez sur Rechercher",
          noDataAvailable: "Aucune donnée disponible",
          chargesByEmployer: "Facturations par entreprise",
          chargesByMonth: "Factures par Mois",
          paymentsVsCharges: "Factures vs. Paiements",
          payments: "Paiements"
        },
        financialReports: {
          title: "Rapports financiers"
        },
        filters: {
          title: "Filtres",
          charges: "Factures",
          withCharges: "Avec facturations",
          paid: "Payées",
          pending: "En attente",
          hasAttachments: "Uniquement avec des pièces jointes",
          recurrent: "Uniquement des tâches récurrentes",
          loadError: "Erreur lors du chargement des données de filtre"
        },
        taskCategories: {
          manageCategories: "Gérer les catégories",
          categoryName: "Nom de la catégorie",
          nameRequired: "Le nom de la catégorie est obligatoire",
          categoryCreated: "Catégorie créée avec succès",
          categoryUpdated: "Catégorie mise à jour avec succès",
          categoryDeleted: "Catégorie supprimée avec succès",
          confirmDelete: "Voulez-vous vraiment supprimer cette catégorie?",
          noCategories: "Aucune catégorie trouvée",
          errorLoading: "Erreur lors du chargement des catégories",
          errorSaving: "Erreur lors de l'enregistrement de la catégorie",
          errorDeleting: "Erreur lors de la suppression de la catégorie",
          cannotDeleteUsed: "Impossible de supprimer cette catégorie car elle est utilisée dans des tâches",
          tasks: "tâches"
        },
        taskSubjects: {
          manageSubjects: "Gérer les sujets",
          subjectName: "Nom du sujet",
          subjectDescription: "Description (optionnel)",
          nameRequired: "Le nom du sujet est obligatoire",
          subjectCreated: "Sujet créé avec succès",
          subjectUpdated: "Sujet mis à jour avec succès",
          subjectDeleted: "Sujet supprimé avec succès",
          confirmDelete: "Voulez-vous vraiment supprimer ce sujet?",
          noSubjects: "Aucun sujet enregistré",
          subjectsList: "Liste des sujets",
          noDescription: "Pas de description",
          errorLoading: "Erreur lors du chargement des sujets",
          errorSaving: "Erreur lors de l'enregistrement du sujet",
          errorDeleting: "Erreur lors de la suppression du sujet",
          cannotDeleteUsed: "Impossible de supprimer ce sujet car il est utilisé dans des tâches"
        },
        toggleView: "Basculer la vue",
        toggleFilters: "Afficher/Masquer les filtres",
        help: {
          tooltip: "Aide sur la Gestion des Tâches",
          title: "Aide - Gestion des Tâches",
          tabs: {
            overview: "Vue d'ensemble",
            interface: "Interface",
            features: "Fonctionnalités",
            kanban: "Kanban",
            financial: "Financier",
            tips: "Conseils"
          },
          overview: {
            title: "Vue d'ensemble du module de tâches",
            introduction: "Le module de Tâches permet de gérer toutes les activités de votre équipe de manière organisée et efficace. Vous pouvez créer, attribuer, suivre et terminer des tâches, ainsi que générer des rapports et des factures.",
            mainFeatures: "Principales fonctionnalités:",
            listView: "Vue en liste",
            listViewDesc: "Visualisez vos tâches dans une liste détaillée avec des filtres et un tri.",
            kanbanView: "Vue Kanban",
            kanbanViewDesc: "Gérez les tâches dans un tableau de bord ou par catégories.",
            financial: "Gestion financière",
            financialDesc: "Créez des factures associées aux tâches et suivez les paiements.",
            reports: "Rapports et statistiques",
            reportsDesc: "Suivez les performances avec des rapports détaillés et des graphiques.",
            benefits: "Avantages:",
            benefitsText: "Avec la gestion des tâches, votre équipe pourra travailler de manière plus organisée, respecter les délais, éviter les oublis, conserver l'historique des activités et faciliter la reddition de comptes à vos clients. Les factures automatiques permettent d'optimiser le processus financier, tandis que les rapports fournissent des informations précieuses pour la gestion."
          },
          interface: {
            title: "Interface et navigation",
            headerSection: "En-tête et barre d'outils",
            headerDesc: "En haut de la page, vous trouverez:",
            searchField: "Champ de recherche",
            searchFieldDesc: "Rechercher des tâches par titre ou informations connexes",
            filterButton: "Bouton de Filtres",
            filterButtonDesc: "Afficher/masquer le panneau de filtres avancés",
            reportButton: "Bouton de Rapports",
            reportButtonDesc: "Accéder à la section des rapports et statistiques",
            financialButton: "Bouton Financier",
            financialButtonDesc: "Menu avec des options pour gérer les facturations",
            viewToggle: "Interrupteur de Vue",
            viewToggleDesc: "Alterne entre la vue en liste et kanban",
            addButton: "Bouton Ajouter",
            addButtonDesc: "Crée une nouvelle tâche",
            tabsSection: "Onglets d'État",
            tabsDesc: "Les onglets permettent de filtrer rapidement les tâches par statut:",
            allTab: "Toutes",
            allTabDesc: "Affiche toutes les tâches",
            pendingTab: "En attente",
            pendingTabDesc: "Tâches qui n'ont pas encore été terminées",
            inProgressTab: "En cours",
            inProgressTabDesc: "Tâches en cours",
            completedTab: "Terminé",
            completedTabDesc: "Tâches terminées",
            paidTab: "Payées",
            paidTabDesc: "Tâches avec paiement effectué",
            unpaidTab: "Non Payées",
            unpaidTabDesc: "Tâches avec paiement en attente",
            recurrentTab: "Récurrentes",
            recurrentTabDesc: "Tâches se répétant automatiquement",
            tableSection: "Tableau des Tâches",
            tableDesc: "Le tableau affiche vos tâches avec les colonnes suivantes:",
            titleColumn: "Titre",
            titleColumnDesc: "Nom de la tâche avec des indicateurs de pièces jointes et de notes",
            statusColumn: "Statut",
            statusColumnDesc: "État actuel de la tâche (En Attente, En Cours, Terminée, En Retard)",
            dueDateColumn: "Date d'échéance",
            dueDateColumnDesc: "Date limite pour terminer la tâche",
            responsibleColumn: "Responsable",
            responsibleColumnDesc: "Utilisateur assigné pour exécuter la tâche",
            categoryColumn: "Catégorie",
            categoryColumnDesc: "Classification de la tâche",
            actionsColumn: "Actions",
            actionsColumnDesc: "Boutons pour marquer comme terminée, éditer et supprimer"
          },
          features: {
            title: "Fonctionnalités Détaillées",
            taskCreation: "Création et Édition de Tâches",
            taskCreationDesc: "Pour créer une nouvelle tâche, cliquez sur le bouton 'Ajouter' dans le coin supérieur droit. Le formulaire permet de configurer:",
            basicInfo: "Informations de base",
            basicInfoDesc: "Titre, description, date d'échéance, catégorie et sujet",
            responsibility: "Responsabilité",
            responsibilityDesc: "Attribution individuelle ou en groupe pour plusieurs utilisateurs",
            clientInfo: "Informations du Client",
            clientInfoDesc: "Liaison à une entreprise et données du demandeur",
            charging: "Configuration de la facturation",
            chargingDesc: "Définir la valeur et le statut de paiement",
            recurrence: "Configuration de la récurrence",
            recurrenceDesc: "Définir la périodicité, la date de fin ou le nombre d'occurrences",
            taskEditingNote: "L'édition des tâches utilise le même formulaire, permettant de modifier n'importe quel paramètre à tout moment.",
            filtering: "Filtres avancés",
            filteringDesc: "Le panneau de filtres permet de affiner votre visualisation en fonction de divers critères:",
            dateFilter: "Filtres de date",
            dateFilterDesc: "Période spécifique avec date de début et de fin",
            userFilter: "Filtre par utilisateur",
            userFilterDesc: "Tâches attribuées à un utilisateur spécifique",
            categoryFilter: "Filtre par catégorie",
            categoryFilterDesc: "Tâches d'une catégorie spécifique",
            employerFilter: "Filtre par entreprise",
            employerFilterDesc: "Tâches associées à une entreprise spécifique",
            statusFilter: "Filtre par statut",
            statusFilterDesc: "En attente, terminées, en cours ou en retard",
            chargeFilter: "Filtre par facturation",
            chargeFilterDesc: "Tâches avec facturation, payées ou en attente",
            attachmentFilter: "Filtre par pièces jointes",
            attachmentFilterDesc: "Tâches avec des pièces jointes",
            recurrenceFilter: "Filtre par récurrence",
            recurrenceFilterDesc: "Seulement les tâches récurrentes",
            sorting: "Tri et organisation",
            sortingDesc: "En plus des filtres, il est possible de trier les tâches selon divers critères:",
            dueDateSort: "Date d'échéance",
            dueDateSortDesc: "Prioriser les tâches par date limite",
            titleSort: "Titre",
            titleSortDesc: "Trier alphabétiquement par titre",
            categorySort: "Catégorie",
            categorySortDesc: "Regrouper les tâches par catégorie",
            importExport: "Importation et exportation",
            importDesc: "La fonction d'importation permet de charger plusieurs tâches à la fois via des fichiers CSV ou Excel:",
            importSteps: "Étapes de l'importation",
            importStepsDesc: "Téléchargement du fichier, mapping des champs, révision et confirmation",
            exportFormats: "Formats d'exportation",
            exportFormatsDesc: "Exportez vos tâches en PDF, Excel ou imprimez directement",
            categories: "Catégories et sujets",
            categoriesDesc: "Le système permet de gérer des catégories et des sujets pour une meilleure organisation:",
            categoryManagement: "Gestion des catégories",
            categoryManagementDesc: "Créez, modifiez et supprimez des catégories pour classer vos tâches",
            subjectManagement: "Gestion des sujets",
            subjectManagementDesc: "Configurez des sujets pour ajouter une deuxième dimension de classification",
            details: "Détails de la tâche",
            detailsDesc: "En cliquant sur une tâche, vous accédez à la fenêtre modale de détails avec plusieurs onglets:",
            notesTab: "Notes",
            notesTabDesc: "Ajoutez des annotations pour documenter le progrès",
            attachmentsTab: "Pièces jointes",
            attachmentsTabDesc: "Téléchargez des fichiers liés à la tâche",
            timelineTab: "Chronologie",
            timelineTabDesc: "Visualisez tout l'historique des actions de la tâche",
            chargesTab: "Factures",
            chargesTabDesc: "Gérez les valeurs et les paiements associés à la tâche",
            detailsTab: "Détails",
            detailsTabDesc: "Informations complètes sur l'entreprise, le demandeur et les paramètres"
          },
          kanban: {
            title: "Vue Kanban",
            introduction: "La visualisation Kanban offre une perspective visuelle du flux de travail, permettant de gérer les tâches à travers des colonnes représentant différents états ou catégories.",
            modes: "Modes de visualisation",
            modesDesc: "Le Kanban offre deux modes principaux de visualisation:",
            statusMode: "Par statut",
            statusModeDesc: "Organise les tâches dans les colonnes En attente, En cours et Terminé",
            categoryMode: "Par catégorie",
            categoryModeDesc: "Regroupe les tâches par catégorie, permettant de visualiser la répartition du travail",
            dragDrop: "Glisser et Déposer",
            dragDropDesc: "Le principal avantage du Kanban est la fonctionnalité de glisser-déposer:",
            statusChange: "Changement de statut",
            statusChangeDesc: "Dans le mode Statut, faites glisser les tâches entre les colonnes pour changer leur statut",
            categoryChange: "Changement de catégorie",
            categoryChangeDesc: "Dans le mode Catégorie, faites glisser pour reclasser la tâche",
            dragDropTip: "Astuce : Pour modifier rapidement plusieurs tâches, utilisez la visualisation Kanban au lieu d'ouvrir et d'éditer chaque tâche individuellement.",
            filtering: "Filtrage dans le Kanban",
            filteringDesc: "Même dans la visualisation Kanban, vous pouvez utiliser les filtres avancés:",
            filterAccess: "Accès aux filtres",
            filterAccessDesc: "Cliquez sur l'icône de filtre pour afficher/masquer le panneau de filtres",
            filterEffect: "Effet des filtres",
            filterEffectDesc: "Les filtres affectent toutes les colonnes simultanément, ne montrant que les tâches correspondant aux critères",
            cards: "Cartes de tâches",
            cardsDesc: "Les cartes dans le Kanban affichent de manière concise des informations importantes:",
            cardInfo: "Informations visibles",
            cardInfoDesc: "Titre, responsable, date d'échéance, catégorie et indicateurs de pièces jointes/notes",
            cardActions: "Actions rapides",
            cardActionsDesc: "Boutons pour marquer comme terminé, éditer et supprimer directement sur la carte",
            cardClick: "Cliquez sur la carte",
            cardClickDesc: "Cliquez sur n'importe quelle carte pour ouvrir les détails complets de la tâche"
          },
          financial: {
            title: "Gestion financière",
            introduction: "Le module de tâches offre des fonctionnalités financières intégrées, permettant de créer des facturations associées aux tâches, de gérer les paiements et de générer des rapports financiers.",
            taskCharges: "Facturations dans les tâches",
            taskChargesDesc: "Comment ajouter des facturations à une tâche:",
            createCharge: "Création de facturation",
            createChargeDesc: "Lors de la création ou de la modification d'une tâche, activez l'option 'Cette tâche a une facturation' dans la section Informations de facturation",
            chargeSettings: "Paramètres de facturation",
            chargeSettingsDesc: "Définissez le montant à facturer et indiquez s'il a déjà été payé",
            existingCharge: "Tâches avec facturation",
            existingChargeDesc: "Les tâches avec facturation affichent une icône de dollar. Vert pour payé, rouge pour en attente",
            chargeManagement: "Gestion des facturations",
            chargeManagementDesc: "Pour gérer toutes les facturations au même endroit:",
            chargesPage: "Page de facturations",
            chargesPageDesc: "Accédez via le bouton Finance > Gérer les facturations",
            chargeTabs: "Onglets de facturation",
            chargeTabsDesc: "Passez des facturations en attente aux facturations payées",
            chargeActions: "Actions de recouvrement",
            chargeActionsDesc: "Générer un PDF, envoyer par e-mail et enregistrer le paiement",
            chargeFilters: "Filtres de recouvrement",
            chargeFiltersDesc: "Filtrer par entreprise, date d'échéance et autres critères",
            reports: "Rapports financiers",
            reportsDesc: "Suivez les performances financières à travers des rapports:",
            reportAccess: "Accès aux rapports",
            reportAccessDesc: "Bouton financier > Rapports financiers",
            reportSummary: "Résumé financier",
            reportSummaryDesc: "Visualisez les totaux des recouvrements, des montants en attente et reçus",
            reportCharts: "Graphiques financiers",
            reportChartsDesc: "Analysez les données par entreprise, par mois et comparez les recouvrements aux paiements",
            reportFilters: "Personnalisation des rapports",
            reportFiltersDesc: "Filtrez par entreprise, période et autres critères pour des analyses spécifiques",
            invoicing: "Facturation et communication",
            invoicingDesc: "Communiquez avec les clients sur les recouvrements:",
            pdfGeneration: "Génération de PDF",
            pdfGenerationDesc: "Créez des documents de recouvrement professionnels à envoyer aux clients",
            emailSending: "Envoi par e-mail",
            emailSendingDesc: "Envoyez des recouvrements directement aux clients via le système",
            receiptSending: "Envoi de reçus",
            receiptSendingDesc: "Après avoir enregistré les paiements, envoyez des reçus automatiques"
          },
          tips: {
            title: "Conseils et bonnes pratiques",
            organization: "Organisation efficace",
            useCategories: "Utilisez des catégories cohérentes",
            useCategoriesDesc: "Définissez un ensemble standard de catégories pour faciliter l'organisation et les rapports",
            namingConvention: "Normalisez les titres",
            namingConventionDesc: "Adoptez une convention de nommage pour les tâches pour faciliter la recherche (ex: [Client] - Action principale)",
            useDescription: "Descriptions détaillées",
            useDescriptionDesc: "Incluez des informations complètes dans la description pour que tout le monde comprenne ce qui doit être fait",
            teamWork: "Travail d'équipe",
            useNotes: "Utilisez des notes pour la communication",
            useNotesDesc: "Documentez les progrès et les défis dans les notes pour tenir l'équipe informée",
            groupAssignment: "Attribution en groupe",
            groupAssignmentDesc: "Pour les tâches complexes, attribuez à plusieurs utilisateurs pour la collaboration",
            attachRelevantFiles: "Joindre des fichiers pertinents",
            attachRelevantFilesDesc: "Gardez tous les fichiers nécessaires attachés à la tâche pour un accès facile",
            timeManagement: "Gestion du temps",
            setRealisticDates: "Établissez des délais réalistes",
            setRealisticDatesDesc: "Évitez les délais impossibles à respecter pour maintenir l'équipe motivée",
            useInProgress: "Utilisez le statut 'En cours'",
            useInProgressDesc: "Lorsque vous commencez à travailler sur une tâche, déplacez-la vers 'En cours' pour une meilleure visualisation",
            reviewDailyTasks: "Passez en revue les tâches quotidiennement",
            reviewDailyTasksDesc: "Commencez la journée en vérifiant les tâches en attente et organisez la visualisation Kanban",
            financialBestPractices: "Bonnes pratiques financières",
            linkToEmployer: "Lier aux entreprises",
            linkToEmployerDesc: "Associez toujours les tâches de recouvrement aux entreprises pour faciliter la facturation",
            regularReports: "Rapports réguliers",
            regularReportsDesc: "Générez des rapports financiers hebdomadaires ou mensuels pour suivre les encaissements",
            documentPayments: "Documentez les paiements",
            documentPaymentsDesc: "Lors de l'enregistrement des paiements, ajoutez des informations détaillées dans les observations",
            kanbanUsage: "Utilisation efficace du Kanban",
            statusModeForWorkflow: "Mode Statut pour le flux de travail",
            statusModeForWorkflowDesc: "Utilisez le mode statut pour gérer les tâches en cours au quotidien",
            categoryModeForPlanning: "Mode Catégorie pour la planification",
            categoryModeForPlanningDesc: "Utilisez le mode catégorie pour évaluer la répartition du travail et faire de la planification",
            limitWIP: "Limitez le travail en cours",
            limitWIPDesc: "Évitez d'avoir trop de tâches en cours simultanément pour améliorer la productivité"
          }
        }
      },
      taskCategories: {
        manageCategories: "Gérer les catégories",
        categoryName: "Catégorie",
        nameRequired: "Le nom de la catégorie est obligatoire",
        noCategories: "Pas de catégories",
        tasks: "Tâches"
      },
      kanban: {
        title: "Tableau Kanban",
        openTickets: "Ouvert",
        queue: {
          title: "Tableau par Secteur",
          selectQueue: "Sélectionnez un secteur",
          selectQueuePrompt: "Sélectionnez un secteur pour visualiser le tableau Kanban",
          newLane: {
            title: "Nouvelle Colonne",
            name: "Nom de la colonne",
            color: "Couleur de la colonne",
            create: "Créer une colonne",
            success: "Colonne créée avec succès",
            error: "Erreur lors de la création de la colonne"
          },
          errors: {
            loadQueues: "Erreur lors du chargement des secteurs",
            loadLanes: "Erreur lors du chargement des colonnes",
            loadTickets: "Erreur lors du chargement des tickets",
            moveCard: "Erreur lors du déplacement du ticket",
            deleteTag: "Erreur lors de la suppression de la colonne",
            updateTag: "Erreur lors de la mise à jour de la colonne"
          },
          success: {
            cardMoved: "Ticket déplacé avec succès",
            tagDeleted: "Colonne supprimée avec succès",
            tagUpdated: "Colonne mise à jour avec succès"
          }
        },
        filters: {
          searchPlaceholder: "Rechercher des tickets...",
          dateFrom: "Date de début",
          dateTo: "Date de fin",
          users: "Filtrer par agent",
          status: "Statut du ticket",
          queues: "Secteurs",
          noResults: "Aucun résultat trouvé"
        },
        card: {
          ticketNumber: "Ticket #",
          customer: "Client",
          lastMessage: "Dernier message",
          assignedTo: "Assigné à",
          status: "Statut",
          queue: "Secteur",
          createdAt: "Créé le",
          updatedAt: "Mis à jour le",
          noMessage: "Pas de messages"
        },
        lane: {
          actions: {
            edit: "Modifier la colonne",
            delete: "Supprimer la colonne",
            confirm: "Confirmer",
            cancel: "Annuler"
          },
          edit: {
            title: "Modifier la colonne",
            name: "Nom",
            color: "Couleur",
            save: "Enregistrer les modifications"
          },
          delete: {
            title: "Excluir Coluna",
            message: "Êtes-vous sûr de vouloir supprimer cette colonne?",
            warning: "Tous les tickets seront déplacés vers la colonne par défaut"
          },
          tickets: "tickets"
        },
        actions: {
          settings: "Paramètres du tableau",
          newLane: "Nouvelle colonne",
          refresh: "Actualiser le tableau",
          expand: "Développer",
          collapse: "Réduire"
        },
        settings: {
          title: "Configurações do Quadro",
          general: {
            title: "Paramètres généraux",
            autoRefresh: "Mise à jour automatique",
            refreshInterval: "Intervalle de mise à jour",
            cardSize: "Taille des cartes",
            compactView: "Vue compacte"
          },
          display: {
            title: "Affichage",
            showAvatars: "Afficher les avatars",
            showTags: "Afficher les étiquettes",
            showPriority: "Afficher la priorité",
            showDueDate: "Afficher la date limite"
          }
        },
        tooltips: {
          addLane: "Ajouter une nouvelle colonne",
          editLane: "Modifier la colonne",
          deleteLane: "Supprimer la colonne",
          moveTicket: "Déplacer le ticket",
          openTicket: "Ouvrir le ticket"
        },
        emptyState: {
          title: "Sélectionnez un secteur pour afficher le Kanban",
          message: "Pour afficher les tickets dans le tableau Kanban, sélectionnez d'abord un secteur dans le menu ci-dessus.",
          buttonText: "Sélectionner un secteur"
        },
        confirmations: {
          deleteLane: {
            title: "Excluir Coluna",
            message: "Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita."
          }
        },
        notifications: {
          ticketMoved: "Ticket movido para {lane}",
          laneCreated: "Colonne créée avec succès",
          laneUpdated: "Colonne mise à jour avec succès",
          laneDeleted: "Colonne supprimée avec succès"
        },
        infoModal: {
          title: "Informations sur le tableau Kanban",
          tooltipInfo: "Informations sur le Kanban",
          closeButton: "Fermer",
          scheduleTimeTitle: "Horaire de planification:",
          scheduleTimeDescription: "Toutes les planifications seront envoyées entre 18h00 et 18h30.",
          recurringScheduleTitle: "Planification récurrente:",
          recurringStep1: "Allez à l'onglet \"Tags de Campagne\".",
          recurringStep2: "Créez de nouvelles étiquettes si nécessaire.",
          recurringStep3: "Suivez ces étapes:",
          subStep1: "Allez dans l'engrenage des paramètres.",
          subStep2: "Sélectionnez l'un des tableaux disponibles.",
          subStep3: "Modifiez le message qui sera envoyé.",
          subStep4: "Si nécessaire, choisissez un fichier à envoyer.",
          subStep5: "Choisissez la fréquence de planification (tous les combien de jours).",
          subStep6: "Cliquez sur \"Enregistrer\".",
          noActiveCampaignsTitle: "Tickets sans campagnes actives :",
          noActiveCampaignsDescription: "Tous les tickets sans campagnes actives seront placés dans le tableau \"En attente\".",
          createCampaignTitle: "Créer une campagne :",
          createCampaignDescription: "Pour créer une campagne, faites glisser le ticket vers le tableau de campagne de votre choix.",
          moveTicketsTitle: "Déplacer des tickets entre les tableaux :",
          moveTicketsStep1: "Lorsque vous déplacez un ticket vers un tableau, les planifications seront effectuées en fonction des paramètres du tableau.",
          moveTicketsStep2: "Lorsque vous déplacez un ticket vers un autre tableau, les planifications existantes seront supprimées et une nouvelle planification sera créée en fonction du tableau choisi.",
          moveTicketsStep3: "Lorsque vous déplacez un ticket de retour vers le tableau \"En attente\", les planifications existantes du ticket seront supprimées."
        }
      },
      transferTicketsModal: {
        title: "Transférer des tickets",
        warning: "Attention ! Cette action est irréversible",
        description: "Sélectionnez une connexion pour transférer les tickets avant de supprimer cette connexion. Tous les tickets en attente seront déplacés vers la connexion sélectionnée.",
        selectLabel: "Sélectionnez la connexion de destination",
        sourceConnection: {
          label: "Connexion d'origine",
          status: {
            active: "Active",
            inactive: "Inactive"
          }
        },
        buttons: {
          cancel: "Annuler",
          confirm: "Transférer et supprimer"
        },
        success: "Tickets transférés avec succès !",
        error: "Erreur lors du transfert des tickets. Veuillez réessayer."
      },
      queueIntegration: {
        title: "Intégrations",
        table: {
          id: "ID",
          type: "Type",
          name: "Nom",
          projectName: "Nom du Projet",
          language: "Langue",
          lastUpdate: "Dernière mise à jour",
          actions: "Actions"
        },
        buttons: {
          add: "Ajouter un projet"
        },
        toasts: {
          deleted: "Intégration supprimée avec succès."
        },
        searchPlaceholder: "Rechercher...",
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Êtes-vous sûr ? Cette action est irréversible ! et sera supprimée des secteurs et connexions associés"
        },
        form: {
          n8nApiKey: "Clé API de n8n"
        }
      },
      files: {
        modal: {
          addTitle: "Nouvelle liste de fichiers",
          editTitle: "Modifier la liste de fichiers",
          name: "Nom de la liste",
          description: "Description",
          add: "Ajouter",
          saveChanges: "Enregistrer les modifications",
          cancel: "Annuler",
          noPreview: "Aucun aperçu disponible"
        },
        buttons: {
          add: "Ajouter",
          edit: "Éditer",
          delete: "Supprimer",
          upload: "Choisir un fichier",
          download: "Télécharger",
          close: "Fermer",
          openPdf: "Ouvrir le PDF",
          selectFile: "Sélectionner un fichier",
          addList: "Nouvelle liste"
        },
        deleteDialog: {
          title: "Supprimer la liste de fichiers",
          message: "Cette action supprimera tous les fichiers associés à cette liste. Cette action est irréversible."
        },
        deleteFileDialog: {
          title: "Supprimer le fichier",
          message: "Êtes-vous sûr de vouloir supprimer ce fichier? Cette action est irréversible."
        },
        empty: {
          title: "Aucune liste de fichiers trouvée",
          message: "Créez votre première liste de fichiers à partager dans vos campagnes."
        },
        tooltips: {
          edit: "Modifier la liste",
          delete: "Supprimer la liste",
          view: "Voir le fichier",
          download: "Télécharger le fichier"
        },
        searchPlaceholder: "Rechercher des listes de fichiers...",
        filesList: "Fichiers dans la liste",
        emptyFileList: "Aucun fichier dans cette liste. Téléchargez votre premier fichier.",
        preview: {
          title: "Visualisation du fichier",
          description: "Description",
          details: "Détails du fichier",
          noPreview: "Visualisation non disponible pour ce fichier",
          pdfMessage: "Cliquez sur le bouton ci-dessous pour ouvrir le PDF",
          notSupported: "Visualisation non disponible pour ce type de fichier"
        },
        table: {
          name: "Nom",
          type: "Type",
          size: "Taille",
          actions: "Actions",
          unknownType: "Type inconnu"
        },
        validation: {
          nameRequired: "Le nom est obligatoire",
          nameMin: "Le nom doit comporter au moins 2 caractères",
          nameMax: "Le nom doit comporter au maximum 100 caractères",
          descriptionMax: "La description doit comporter au maximum 500 caractères"
        },
        toasts: {
          added: "Liste de fichiers créée avec succès!",
          updated: "Liste de fichiers mise à jour avec succès!",
          deleted: "Liste de fichiers supprimée avec succès!",
          fileDeleted: "Fichier supprimé avec succès!",
          fileAddedToList: "Fichier ajouté avec succès!",
          filesAddedToList: "{count} fichiers ajoutés avec succès!",
          fetchError: "Erreur lors de la recherche de listes de fichiers.",
          error: "Une erreur s'est produite. Veuillez réessayer.",
          deleteError: "Erreur lors de la suppression de la liste de fichiers.",
          deleteFileError: "Erreur lors de la suppression du fichier.",
          uploadError: "Erreur lors du téléchargement du fichier.",
          uploadMultipleError: "Erreur lors du téléchargement des fichiers."
        },
        noResults: "Aucun résultat trouvé pour la recherche."
      },
      messagesAPI: {
        title: "API",
        contactNumber: "Nº de contact",
        contactName: "Nom du contact",
        contactEmail: "E-mail du contact",
        statusCompany: "Statut de l'entreprise",
        searchParam: "Nom ou numéro de contact",
        pageNumber: "Numéro de page pour la pagination",
        doc: "Documentation pour l'envoi de messages:",
        formMethod: "Méthode d'envoi:",
        token: "Token enregistré",
        apiToken: "Token enregistré",
        ticketId: "ID du ticket",
        queueId: "ID du secteur",
        status: "Statut du ticket",
        id: "ID de la facture",
        updateFields: "Données à mettre à jour",
        updateData: "Données à mettre à jour",
        queue: "Secteur",
        tags: "Tags",
        tagId: "ID de l'étiquette",
        invoiceId: "ID de la facture",
        companyId: "ID de l'entreprise",
        body: "Message",
        contactData: "Données de contact",
        contactId: "ID du contact",
        file: "Fichier",
        number: "Numéro",
        pdfLink: "Lien du PDF",
        medias: "Médias",
        imageLink: "Lien de l'image",
        audioLink: "Lien audio",
        textMessage: {
          number: "Numéro",
          body: "Message",
          token: "Token enregistré"
        },
        mediaMessage: {
          number: "Numéro",
          body: "Nom du fichier",
          media: "Fichier",
          token: "Token enregistré"
        },
        buttons: {
          submit: "Envoyer"
        },
        helpTexts: {
          textMsg: {
            title: "Message texte",
            info: "Voici la liste des informations nécessaires pour ",
            endpoint: "Point de terminaison: ",
            method: "Méthode: ",
            headers: "En-têtes: ",
            body: "Corps: "
          },
          test: "Test d'envoi: ",
          mediaMsg: {
            title: "Message multimédia",
            info: "Voici la liste des informations nécessaires pour ",
            endpoint: "Point de terminaison: ",
            method: "Méthode: ",
            headers: "En-têtes: ",
            body: "Corps: ",
            formData: "Données de formulaire: "
          },
          instructions: "Instructions",
          notes: {
            title: "Remarques importantes",
            textA: "Avant d'envoyer des messages, il est nécessaire d'enregistrer le jeton lié à la connexion qui enverra les messages. <br/>Pour enregistrer, accédez au menu 'Connexions', cliquez sur le bouton d'édition de la connexion et insérez le jeton dans le champ approprié.",
            textB: {
              title: "Le numéro à envoyer ne doit pas avoir de masque ou de caractères spéciaux et doit être composé de:",
              partA: "Code pays",
              partB: "DDD",
              partC: "Numéro"
            }
          },
          info: "Voici la liste des informations nécessaires pour ",
          endpoint: "Point de terminaison: ",
          method: "Méthode: ",
          headers: "En-têtes: ",
          body: "Corps: "
        },
        apiRoutes: {
          token: "Jeton pour la validation de la connexion"
        }
      },
      notifications: {
        title: "Messages",
        message: "message",
        messages: "messages",
        noTickets: "Aucun message non lu.",
        clearAll: "Tout effacer",
        cleared: "Notifications effacées avec succès!",
        clearError: "Erreur lors de la suppression des notifications!",
        newMessage: "Nouveau message",
        permissionGranted: "Autorisation pour les notifications accordée!",
        permissionDenied: "Autorisation pour les notifications refusée. Activez dans les paramètres du navigateur.",
        permissionError: "Erreur lors de la demande d'autorisation pour les notifications.",
        enableNotifications: "Activer les notifications"
      },
      quickMessages: {
        title: "Réponses rapides",
        searchPlaceholder: "Rechercher...",
        noAttachment: "Pas de pièce jointe",
        permission: "Seuls les administrateurs et les superviseurs peuvent éditer",
        confirmationModal: {
          deleteTitle: "Supprimer la réponse rapide",
          deleteMessage: "Cette action est irréversible! Voulez-vous continuer?"
        },
        buttons: {
          add: "Ajouter une réponse rapide",
          attach: "Joindre un fichier",
          cancel: "Annuler",
          edit: "Éditer",
          delete: "Supprimer",
          startRecording: "Démarrer l'enregistrement",
          stopRecording: "Arrêter l'enregistrement",
          playAudio: "Lire l'audio",
          save: "Enregistrer"
        },
        toasts: {
          success: "Réponse rapide ajoutée avec succès!",
          deleted: "Réponse rapide supprimée avec succès!",
          error: "Erreur lors du traitement de la réponse rapide"
        },
        dialog: {
          title: "Réponse rapide",
          shortcode: "Raccourci",
          message: "Réponse",
          save: "Enregistrer",
          cancel: "Annuler",
          geral: "Autoriser l'édition",
          add: "Ajouter",
          edit: "Éditer",
          visao: "Autoriser la visualisation",
          no: "Non",
          yes: "Oui",
          geralHelper: "Autoriser tous les utilisateurs à modifier cette réponse rapide",
          recordedAudio: "Audio enregistré",
          validation: {
            required: "Ce champ est obligatoire",
            minLength: "Minimum de 3 caractères",
            maxLength: "Maximum de 255 caractères"
          }
        },
        table: {
          shortcode: "Raccourci",
          message: "Message",
          actions: "Actions",
          mediaName: "Nom du fichier",
          status: "Statut",
          media: "Média",
          permissions: "Autorisations",
          createdAt: "Créé le",
          updatedAt: "Mis à jour le"
        }
      },
      mediaInput: {
        previewTitle: "Aperçu du média",
        caption: "Ajouter une légende...",
        captions: "Légendes",
        addTag: "Ajouter un tag (hashtag)",
        duplicate: "Dupliquer",
        attach: "Joindre fichier(s)",
        contact: "Contacts",
        metadata: {
          title: "Titre",
          name: "Nom",
          type: "Type",
          size: "Taille",
          modified: "Modifié le :"
        },
        buttons: {
          crop: "Recadrer l'image",
          draw: "Dessiner sur l'image",
          zoomIn: "Zoom avant",
          showMetadata: "Afficher les métadonnées du fichier",
          zoomOut: "Zoom arrière",
          addTag: "Ajouter un hashtag",
          duplicate: "Dupliquer",
          delete: "Supprimer",
          cancel: "Annuler",
          send: "Envoyer",
          fullscreen: "Passer en plein écran",
          download: "Télécharger",
          copy: "Copier"
        }
      },
      messageVariablesPicker: {
        label: "Variables disponibles",
        vars: {
          contactFirstName: "Prénom",
          contactName: "Nom",
          ticketId: "ID du ticket",
          user: "Utilisateur",
          greeting: "Salutation",
          ms: "Millisecondes",
          hour: "Heure",
          date: "Date",
          queue: "Secteur",
          connection: "Connexion",
          dataHora: "Date et heure",
          protocolNumber: "N. Protocole",
          nameCompany: "Nom de l'entreprise"
        }
      },
      contactLists: {
        dialog: {
          add: "Nouvelle liste de contacts",
          edit: "Modifier la liste de contacts",
          name: "Nom de la liste",
          cancel: "Annuler",
          okAdd: "Ajouter",
          okEdit: "Enregistrer"
        },
        confirmationModal: {
          deleteTitle: "Supprimer la liste de contacts",
          deleteMessage: "Cette action ne peut pas être annulée. Tous les contacts de cette liste seront supprimés."
        },
        empty: {
          title: "Aucune liste de contacts trouvée",
          message: "Créez votre première liste de contacts pour commencer des campagnes.",
          button: "Créer une liste"
        },
        searchPlaceholder: "Rechercher des listes de contacts...",
        toasts: {
          fetchError: "Erreur lors de la recherche de listes de contacts.",
          deleted: "Liste de contacts supprimée avec succès !",
          added: "Liste de contacts créée avec succès !",
          edited: "Liste de contacts mise à jour avec succès !",
          saveError: "Erreur lors de l'enregistrement de la liste de contacts."
        },
        buttons: {
          add: "Nouvelle liste",
          edit: "Éditer",
          delete: "Supprimer"
        },
        table: {
          name: "Nom",
          contacts: "Contacts",
          actions: "Actions"
        }
      },
      announcements: {
        active: "Actif",
        inactive: "Inactif",
        title: "Informatifs",
        searchPlaceholder: "Recherche",
        buttons: {
          add: "Nouvelle newsletter",
          contactLists: "Listes de newsletters"
        },
        empty: {
          title: "Aucune newsletter disponible",
          message: "Aucune communication trouvée. Cliquez sur 'Nouvelle newsletter' pour en créer une !",
          button: "Nouvelle newsletter"
        },
        form: {
          title: "Titre de la newsletter",
          uploadMedia: "Joindre fichier(s)",
          priority: "Priorité de la newsletter"
        },
        table: {
          priority: "Priorité",
          title: "Titre",
          text: "Texte",
          mediaName: "Fichier",
          status: "Statut",
          actions: "Actions",
          createdAt: "Date de création"
        },
        modal: {
          addTitle: "Création d'une nouvelle newsletter",
          editTitle: "Modification de l'information"
        },
        priority: {
          low: "Faible",
          medium: "Média",
          high: "Élevée"
        },
        dialog: {
          edit: "Édition de l'information",
          add: "Nouvelle newsletter",
          update: "Modifier l'information",
          readonly: "Visualisation uniquement",
          form: {
            priority: "Priorité",
            title: "Titre",
            text: "Texte",
            mediaPath: "Fichier",
            status: "Statut"
          },
          buttons: {
            add: "Ajouter",
            edit: "Mettre à jour",
            okadd: "D'accord",
            cancel: "Annuler",
            close: "Fermer",
            attach: "Joindre un fichier"
          }
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Cette action ne peut pas être annulée."
        },
        toasts: {
          success: "Opération réussie",
          deleted: "Enregistrement supprimé"
        },
        tooltips: {
          addNew: "Ajouter une nouvelle information",
          listView: "Basculer en mode liste",
          cardView: "Basculer en mode carte"
        }
      },
      queues: {
        title: "Secteurs & Chatbot",
        noDataFound: "Aucun secteur trouvé.",
        noDataFoundMessage: "Il semble qu'il n'y a pas encore de secteurs enregistrés. Ajoutez-en un nouveau et optimisez votre communication !",
        table: {
          id: "ID",
          name: "Nom",
          color: "Couleur",
          greeting: "Message de salutation",
          actions: "Actions",
          orderQueue: "Classement du secteur (bot)"
        },
        buttons: {
          add: "Ajouter un secteur"
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Êtes-vous sûr ? Cette action ne peut pas être annulée ! Les services de ce secteur continueront d'exister, mais ne seront plus attribués à aucun secteur."
        },
        toasts: {
          success: "Opération réussie",
          deleted: "Secteur supprimé avec succès"
        }
      },
      queueSelect: {
        inputLabel: "Secteurs"
      },
      users: {
        title: "Utilisateurs",
        userUser: "Devenir SuperAdmin",
        table: {
          name: "Nom",
          email: "E-mail",
          profile: "Profil",
          status: "Statut",
          actions: "Actions"
        },
        buttons: {
          add: "Ajouter un utilisateur",
          edit: "Modifier l'utilisateur",
          delete: "Supprimer l'utilisateur",
          duplicate: "Dupliquer l'utilisateur",
          listView: "Vue en liste",
          cardView: "Vue en cartes"
        },
        labels: {
          selectCompany: "Sélectionner l'entreprise",
          allCompanies: "Toutes les entreprises"
        },
        roles: {
          admin: "Administrateur",
          user: "Utilisateur",
          superv: "Superviseur"
        },
        profile: {
          admin: "Administrateur",
          user: "Utilisateur",
          superv: "Superviseur"
        },
        confirmationModal: {
          deleteTitle: "Confirmer la suppression",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer cet utilisateur?"
        },
        toasts: {
          deleted: "Utilisateur supprimé avec succès",
          deleteError: "Erreur lors de la suppression de l'utilisateur",
          duplicated: "Utilisateur dupliqué avec succès",
          duplicateError: "Erreur lors de la duplication de l'utilisateur",
          loadUsersError: "Erreur lors du chargement des utilisateurs",
          loadCompaniesError: "Erreur lors du chargement des entreprises"
        },
        status: {
          online: "En ligne:",
          offline: "Hors ligne:"
        },
        superUserIndicator: "Super administrateur"
      },
      stripe: {
        title: "Paramètres de Stripe",
        publicKey: "Clé publique",
        secretKey: "Clé secrète",
        webhookSecret: "Clé du webhook",
        webhookUrl: "URL du webhook",
        publicKeyTooltip: "Clé publique de Stripe (pk_...)",
        secretKeyTooltip: "Clé secrète de Stripe (sk_...)",
        webhookSecretTooltip: "Clé secrète du webhook (whsec_...)",
        webhookUrlTooltip: "Utilisez cette URL pour configurer le webhook dans le tableau de bord Stripe"
      },
      compaies: {
        title: {
          main: "Entreprises",
          add: "Enregistrer l'entreprise",
          edit: "Modifier l'entreprise"
        },
        table: {
          id: "ID",
          status: "Actif",
          name: "Nom",
          email: "E-mail",
          passwordDefault: "Mot de passe",
          numberAttendants: "Agents",
          numberConections: "Connexions",
          value: "Valeur",
          namePlan: "Nom du plan",
          numberQueues: "Secteurs",
          useCampaigns: "Campagnes",
          useExternalApi: "API Rest",
          useFacebook: "Facebook",
          useInstagram: "Instagram",
          useWhatsapp: "Whatsapp",
          useInternalChat: "Chat interne",
          useSchedules: "Planification",
          createdAt: "Créé le",
          dueDate: "Échéance",
          lastLogin: "Dernière connexion",
          folderSize: "Taille du dossier",
          numberOfFiles: "Nombre de fichiers",
          lastUpdate: "Dernière mise à jour",
          actions: "Actions"
        },
        buttons: {
          add: "Ajouter une entreprise",
          cancel: "Annuler les modifications",
          okAdd: "Enregistrer",
          okEdit: "Modifier"
        },
        toasts: {
          deleted: "Entreprise supprimée avec succès."
        },
        confirmationModal: {
          deleteTitle: "Supprimer",
          deleteMessage: "Toutes les données de l'entreprise seront perdues. Les tickets ouverts de cet utilisateur seront déplacés vers le département."
        }
      },
      helps: {
        title: "Centre d'aide",
        videoTab: "Vidéos d'aide",
        apiTab: "Documentation API",
        noDataFound: "Aucune vidéo disponible",
        noDataFoundMessage: "Il n'y a actuellement aucune vidéo d'aide enregistrée dans le système."
      },
      schedules: {
        title: "Rendez-vous",
        searchPlaceholder: "Rechercher des rendez-vous...",
        loading: "Chargement des rendez-vous...",
        emptyState: {
          title: "Aucun rendez-vous trouvé",
          description: "Créez un nouveau rendez-vous ou ajustez les filtres de recherche"
        },
        buttons: {
          add: "Nouvelle Planification",
          addShort: "Nouveau",
          edit: "Éditer",
          delete: "Supprimer",
          save: "Enregistrer",
          create: "Créer",
          cancel: "Annuler",
          close: "Fermer",
          filter: "Filtrer",
          calendarView: "Vue du calendrier",
          listView: "Vue en liste",
          refresh: "Mettre à jour",
          view: "Voir les détails",
          download: "Télécharger la pièce jointe"
        },
        filters: {
          all: "Tous les rendez-vous",
          pending: "En attente",
          sent: "Envoyés",
          error: "Avec erreur",
          allConnections: "Toutes les connexions",
          whatsappConnection: "Filtrer par connexion"
        },
        tabs: {
          today: "Aujourd'hui",
          pending: "En attente",
          sent: "Envoyés"
        },
        stats: {
          total: "Total des rendez-vous",
          pending: "En attente",
          sent: "Envoyés",
          error: "Avec erreur"
        },
        status: {
          sent: "Envoyé",
          pending: "En attente",
          error: "Erreur",
          processing: "En cours de traitement",
          cancelled: "Annulé",
          unknown: "Inconnu"
        },
        form: {
          titleAdd: "Nouvelle Planification",
          titleEdit: "Modifier la Planification",
          contactSection: "Contact",
          messageSection: "Message",
          messagePlaceholder: "Entrez le message à envoyer...",
          scheduleSection: "Planification",
          recurrenceSection: "Récurrence",
          whatsappSection: "Connexion à utiliser",
          selectWhatsapp: "Sélectionnez la connexion",
          sendAt: "Date et heure d'envoi",
          sendAtHelp: "Le message sera envoyé automatiquement à cette date et heure",
          enableRecurrence: "Activer la récurrence",
          recurrencePattern: "Modèle de récurrence",
          recurrenceEndDate: "Date de fin de la récurrence",
          recurrenceHelp: "Les messages seront envoyés de manière répétée jusqu'à la date de fin",
          attachment: "Pièce jointe",
          attachmentHelp: "Taille maximale : 5MB",
          insertEmoji: "Insérer un emoji",
          uploadImage: "Envoyer une image"
        },
        recurrence: {
          none: "Sans récurrence",
          daily: "Quotidiennement",
          weekly: "Hebdomadairement",
          biweekly: "Toutes les deux semaines",
          monthly: "Mensuellement",
          quarterly: "Trimestriellement",
          semiannually: "Semestriellement",
          yearly: "Annuellement"
        },
        scheduleDetails: {
          title: "Détails de la planification",
          contactInfo: "Informations de contact",
          details: "Détails",
          message: "Message",
          attachment: "Pièce jointe",
          createdAt: "Créé le",
          sendAt: "Planifié pour",
          sentAt: "Envoyé le",
          recurrence: {
            title: "Récurrence",
            none: "Sans récurrence",
            daily: "Quotidiennement",
            weekly: "Hebdomadairement",
            biweekly: "Toutes les deux semaines",
            monthly: "Mensuellement",
            quarterly: "Trimestriellement",
            semiannually: "Semestriellement",
            yearly: "Annuellement"
          },
          recurrenceEnd: "Fin de la récurrence",
          createdBy: "Créé par",
          errorTitle: "Erreur d'envoi",
          whatsappConnection: "Connexion à utiliser",
          errorMessage: "Une erreur s'est produite lors de la tentative d'envoi de ce message",
          downloadError: "Erreur lors du téléchargement de la pièce jointe",
          buttons: {
            close: "Fermer",
            edit: "Éditer",
            delete: "Supprimer",
            download: "Télécharger"
          },
          contact: "Contact",
          status: {
            sent: "Envoyé",
            pending: "En attente",
            error: "Erreur",
            processing: "En cours de traitement",
            cancelled: "Annulé",
            unknown: "Inconnu"
          }
        },
        selectContact: "Sélectionnez un contact",
        loadingContacts: "Chargement des contacts...",
        noContactsFound: "Aucun contact trouvé",
        contactSelectError: "Erreur lors du chargement des contacts",
        validation: {
          bodyRequired: "Le message est obligatoire",
          bodyMinLength: "Le message doit contenir au moins 5 caractères",
          contactRequired: "Vous devez sélectionner un contact",
          sendAtRequired: "La date d'envoi est obligatoire",
          futureDateRequired: "La date d'envoi doit être future",
          patternRequired: "Le motif de récurrence est obligatoire",
          endDateRequired: "La date de fin de la récurrence est obligatoire",
          endDateAfterSendAt: "La date de fin doit être postérieure à la date d'envoi"
        },
        toasts: {
          created: "Rendez-vous créé avec succès",
          updated: "Rendez-vous mis à jour avec succès",
          deleted: "Rendez-vous supprimé avec succès",
          attachmentDeleted: "Pièce jointe supprimée avec succès",
          loadError: "Erreur lors du chargement des rendez-vous",
          saveError: "Erreur lors de l'enregistrement du rendez-vous",
          deleteError: "Erreur lors de la suppression du rendez-vous",
          attachmentError: "Erreur lors de l'envoi de la pièce jointe",
          attachmentDeleteError: "Erreur lors de la suppression de la pièce jointe",
          contactLoadError: "Erreur lors du chargement des contacts",
          fileSizeError: "Le fichier doit avoir au maximum 5 Mo"
        },
        calendar: {
          date: "Date",
          time: "Heure",
          event: "Événement",
          allDay: "Journée entière",
          week: "Semaine",
          work_week: "Semaine de travail",
          day: "Jour",
          month: "Mois",
          previous: "Précédent",
          next: "Suivant",
          yesterday: "Hier",
          tomorrow: "Demain",
          today: "Aujourd'hui",
          agenda: "Agenda",
          noEventsInRange: "Aucun rendez-vous dans cette période"
        },
        confirmationModal: {
          deleteTitle: "Supprimer le rendez-vous",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer ce rendez-vous? Cette action est irréversible."
        },
        attachment: "Pièce jointe",
        unknownContact: "Contact inconnu"
      },
      validation: {
        required: "Ce champ est obligatoire",
        invalidTime: "Format d'heure invalide",
        endBeforeStart: "L'heure de fin ne peut pas être antérieure à l'heure de début",
        lunchOutsideWork: "L'heure du déjeuner doit être pendant les heures de travail",
        lunchEndBeforeStart: "La fin du déjeuner ne peut pas être antérieure au début du déjeuner",
        completeLunchTime: "Remplissez les deux heures de déjeuner ou laissez-les vides"
      },
      contactPicker: {
        label: "Sélectionner un contact",
        typeMore: "Entrez au moins 2 caractères pour rechercher",
        noOptions: "Aucun contact trouvé",
        loading: "Chargement...",
        noResultsFound: "Aucun résultat trouvé pour cette recherche",
        errorFetching: "Erreur lors de la recherche de contacts",
        errorFetchingInitial: "Erreur lors du chargement du contact initial"
      },
      subscriptionBanner: {
        message: "Votre période d'essai se termine dans {{days}} jours et {{hours}} heures. Abonnez-vous maintenant pour éviter les interruptions de service!",
        subscribe: "S'abonner maintenant"
      },
      common: {
        create: "Enregistrer",
        close: "Fermer",
        edit: "Éditer",
        save: "Enregistrer",
        delete: "Supprimer",
        cancel: "Annuler",
        apply: "Filtrer",
        clear: "Effacer",
        rowsPerPage: "Résultats par page(s):",
        displayedRows: "Page(s):"
      },
      serviceHours: {
        collapse: "Réduire",
        expand: "Développer",
        workingHours: "Heures d'ouverture",
        workTime: "Heures de Travail",
        startTime: "Heure de début",
        endTime: "Heure de fin",
        lunchTime: "Heure du déjeuner",
        startLunchTime: "Début du déjeuner",
        endLunchTime: "Fin du déjeuner",
        formAriaLabel: "Formulaire d'heures commerciales",
        successMessage: "Horaires mis à jour avec succès!",
        defaultError: "Erreur lors de l'enregistrement des horaires. Vérifiez les données saisies.",
        optional: "Optionnel",
        optionalField: "Champ facultatif",
        validation: {
          required: "Champ obligatoire",
          invalidTime: "Format d'heure invalide (utilisez HH:MM)",
          endBeforeStart: "L'heure de fin ne peut pas être antérieure à l'heure de début",
          lunchOutsideWork: "Le déjeuner doit être pendant les heures de travail",
          lunchEndBeforeStart: "La fin du déjeuner ne peut pas être antérieure au début",
          completeLunchTime: "Remplissez les deux heures de déjeuner ou laissez vide"
        },
        daysweek: {
          day1: "Lundi",
          day2: "Mardi",
          day3: "Mercredi",
          day4: "Jeudi",
          day5: "Vendredi",
          day6: "Samedi",
          day7: "Dimanche"
        }
      },
      tags: {
        title: "Tags",
        searchPlaceholder: "Rechercher des tags...",
        noDataFound: "Oups, rien ici!",
        noDataFoundMessage: "Aucun tag trouvé. Ne vous inquiétez pas, vous pouvez en créer un premier! Cliquez sur le bouton ci-dessous pour commencer.",
        buttons: {
          add: "Nouveau Tag",
          edit: "Modifier le Tag",
          delete: "Supprimer le Tag",
          deleteSelected: "Supprimer la sélection",
          addToKanban: "Ajouter au Kanban",
          removeFromKanban: "Retirer du Kanban",
          selectAll: "Sélectionner Tout",
          unselectAll: "Désélectionner Tout",
          bulkActions: "Actions de masse",
          export: "Exporter",
          cancel: "Annuler",
          create: "Créer",
          update: "Mettre à jour"
        },
        toasts: {
          updated: "Tag mise à jour"
        },
        table: {
          id: "ID",
          name: "Nom",
          color: "Couleur",
          tickets: "Tickets",
          kanban: "Kanban",
          actions: "Actions",
          msgRecurrent: "Message récurrent",
          recurrentTime: "Temps récurrent",
          actCamp: "Campagne Active",
          rptDays: "Jours à Répéter"
        },
        tooltips: {
          edit: "Modifier le tag",
          delete: "Supprimer le tag",
          addToKanban: "Ajouter au tableau Kanban",
          removeFromKanban: "Retirer du tableau Kanban",
          bulkActions: "Actions de masse",
          search: "Buscar tags"
        },
        modal: {
          title: {
            add: "Nouveau Tag",
            edit: "Modifier le Tag"
          },
          buttons: {
            create: "Enregistrer l'étiquette",
            update: "Mettre à jour l'étiquette",
            cancel: "Annuler"
          },
          form: {
            name: {
              label: "Nom",
              error: {
                required: "Le nom est obligatoire",
                min: "Nom trop court"
              }
            },
            color: {
              label: "Couleur",
              error: {
                required: "Couleur obligatoire"
              }
            },
            kanban: {
              label: "Kanban"
            }
          }
        },
        confirmationModal: {
          deleteTitle: "Supprimer le Tag",
          deleteMessage: "Voulez-vous vraiment supprimer cette étiquette ?",
          deleteSelectedTitle: "Supprimer les étiquettes sélectionnées",
          deleteSelectedMessage: "Voulez-vous vraiment supprimer les étiquettes sélectionnées ?",
          kanbanTitle: "Mettre à jour Kanban",
          kanbanMessage: "Voulez-vous mettre à jour le statut Kanban des étiquettes sélectionnées ?",
          confirmationMessage: "Cette action est irréversible. Voulez-vous continuer ?",
          confirmButton: "Confirmer",
          cancelButton: "Annuler"
        },
        messages: {
          success: {
            create: "Étiquette créée avec succès",
            update: "Étiquette mise à jour avec succès",
            delete: "Étiquette(s) supprimée(s) avec succès",
            kanban: "Statut Kanban mis à jour avec succès"
          },
          error: {
            create: "Erreur lors de la création de l'étiquette",
            update: "Erreur lors de la mise à jour de l'étiquette",
            delete: "Erreur lors de la suppression de l'étiquette(s)",
            kanban: "Erreur lors de la mise à jour du statut Kanban"
          }
        },
        help: {
          title: "Aide",
          content: "Sur cette page, vous pouvez :\n1. Créer ou modifier une étiquette\n2. Définir un nom pour l'identification\n3. Choisir une couleur personnalisée\n4. Activer/désactiver le mode Kanban pour utiliser l'étiquette dans le tableau Kanban\nConseils\n- Le nom doit comporter au moins 3 caractères\n- La couleur sera utilisée comme arrière-plan de l'étiquette\n- Le mode Kanban permet à l'étiquette d'apparaître dans le tableau de gestion visuelle"
        },
        filters: {
          allTags: "Toutes les étiquettes",
          onlyKanban: "Uniquement Kanban",
          onlyNonKanban: "Uniquement non Kanban"
        },
        bulk: {
          title: "Créer des étiquettes en masse",
          patterns: {
            tag: "Étiquette_1, Étiquette_2, Étiquette_3...",
            ticket: "Ticket_1, Ticket_2, Ticket_3...",
            priority: "Priorité_1, Priorité_2, Priorité_3...",
            status: "Statut_1, Statut_2, Statut_3...",
            department: "Département_1, Département_2, Département_3...",
            day: "Jour_1, Jour_2, Jour_3..."
          },
          validation: {
            quantity: {
              min: "La quantité minimale est de 1",
              max: "La quantité maximale est de 100",
              required: "La quantité est obligatoire"
            },
            pattern: {
              required: "Le modèle de nom est obligatoire"
            }
          },
          form: {
            quantity: "Quantité d'étiquettes",
            pattern: "Modèle de Nom",
            kanban: "Kanban"
          },
          buttons: {
            cancel: "Annuler",
            create: "Créer"
          },
          help: "Sur cette page, vous pouvez :\n1. Créer plusieurs étiquettes en une seule fois\n2. Définir la quantité d'étiquettes (1-100)\n3. Choisir un modèle pour les noms\n4. Activer/désactiver le mode Kanban pour toutes les étiquettes"
        }
      },
      settings: {
        loading: "Chargement des paramètres...",
        loadError: "Erreur lors du chargement des paramètres",
        title: "Paramètres",
        tabs: {
          general: "Général",
          messaging: "Messages",
          notifications: "Notifications",
          security: "Sécurité",
          chatbot: "Chatbot",
          integrations: "Intégrations",
          company: "Entreprise",
          admin: "Admin",
          companies: "Entreprises",
          plans: "Plans",
          helps: "Aide",
          params: "Paramètres",
          schedules: "Horaires"
        },
        general: {
          title: "Paramètres généraux",
          subtitle: "Gérez les paramètres de base du système",
          tickets: {
            title: "Tickets",
            oneTicketPerConnection: "Un ticket par connexion",
            oneTicketPerConnectionHelper: "Limite la création de tickets à un par connexion",
            showValueAndSku: "Afficher la valeur et le SKU",
            showValueAndSkuHelper: "Affiche les informations de valeur et de SKU dans les tickets"
          },
          schedule: {
            title: "Planification",
            disabled: "Désactivé",
            company: "Par entreprise",
            queue: "Par secteur",
            helper: "Définit comment la planification des messages fonctionnera"
          },
          rating: {
            title: "Évaluation",
            enable: "Activer l'évaluation",
            helper: "Permet aux utilisateurs d'évaluer le service"
          },
          contact: {
            title: "Contact",
            showNumber: "Afficher le numéro de contact",
            showNumberHelper: "Affiche le numéro de contact dans les informations du ticket"
          }
        },
        messaging: {
          title: "Paramètres des messages",
          subtitle: "Gérez comment les messages sont traités dans le système",
          quickResponses: {
            title: "Réponses rapides",
            byCompany: "Par entreprise",
            byUser: "Por usuário",
            helper: "Définit comment les réponses rapides sont organisées"
          },
          greetings: {
            title: "Salutations",
            sendOnAccept: "Envoyer lors de l'acceptation du ticket",
            sendOnAcceptHelper: "Envoie un message automatique lorsque qu'un ticket est accepté",
            sendOnSingleQueue: "Envoyer dans un seul secteur",
            sendOnSingleQueueHelper: "Envoie un message automatique lorsqu'il n'y a qu'un seul secteur"
          },
          groups: {
            title: "Groupes",
            ignoreGroups: "Ignorer les messages de groupe",
            ignoreGroupsHelper: "Ne crée pas de tickets pour les messages de groupe"
          },
          transfer: {
            title: "Transfert",
            notifyOnTransfer: "Notifier le transfert",
            notifyOnTransferHelper: "Informe les utilisateurs lorsqu'un ticket est transféré"
          },
          ai: {
            title: "Intelligence Artificielle",
            alert: "Les fonctionnalités d'IA peuvent être soumises à des frais supplémentaires",
            summarize: "Résumer les conversations",
            summarizeHelper: "Génère automatiquement des résumés des conversations en utilisant l'IA"
          }
        },
        notifications: {
          title: "Paramètres de notifications",
          subtitle: "Gérez comment les notifications sont envoyées",
          register: {
            title: "Enregistrement",
            sendEmail: "Envoyer un e-mail à l'enregistrement",
            sendEmailHelper: "Envoie un e-mail de bienvenue aux nouveaux utilisateurs",
            sendMessage: "Envoyer un message à l'enregistrement",
            sendMessageHelper: "Envoie un message de bienvenue aux nouveaux utilisateurs"
          },
          email: {
            title: "E-mail",
            smtpServer: "Serveur SMTP",
            smtpServerHelper: "Adresse du serveur SMTP",
            smtpPort: "Port SMTP",
            smtpPortHelper: "Port du serveur SMTP",
            smtpUser: "Utilisateur SMTP",
            smtpUserHelper: "Utilisateur pour l'authentification SMTP",
            smtpPassword: "Mot de passe SMTP",
            smtpPasswordHelper: "Mot de passe pour l'authentification SMTP",
            testSuccess: "Test SMTP réussi",
            testTooltip: "Tester les paramètres SMTP",
            smtpRequired: "Les paramètres SMTP sont nécessaires pour l'envoi d'e-mails",
            smtpInfo: "En savoir plus sur les paramètres SMTP"
          },
          ticket: {
            title: "Tickets",
            notifyTransfer: "Notifier le transfert",
            notifyTransferHelper: "Notifier lorsqu'un ticket est transféré",
            requireReason: "Exiger un motif lors de la fermeture",
            requireReasonHelper: "Demande un motif lorsque qu'un ticket est fermé"
          }
        },
        security: {
          title: "Paramètres de sécurité",
          subtitle: "Gérez les paramètres de sécurité du système",
          access: {
            title: "Accès",
            allowSignup: "Autoriser l'inscription",
            allowSignupHelper: "Permet aux nouveaux utilisateurs de s'inscrire"
          },
          apiToken: {
            title: "Token API",
            label: "Token d'accès à l'API",
            warning: "Gardez ce token en sécurité",
            helper: "Token pour l'intégration avec l'API",
            generated: "Nouveau token généré avec succès",
            deleted: "Token supprimé avec succès",
            copied: "Token copié dans le presse-papiers",
            error: "Erreur lors de la gestion du token",
            info: "Utilisez ce token pour authentifier les requêtes à l'API"
          },
          limits: {
            title: "Limites",
            downloadLimit: "Limite de téléchargement",
            downloadLimitHelper: "Taille maximale pour le téléchargement de fichiers"
          }
        },
        chatbot: {
          title: "Paramètres du Chatbot",
          subtitle: "Gérez les paramètres du chatbot",
          general: {
            title: "Général",
            show: "Afficher le chatbot dans le menu",
            showHelper: "Exibe o chatbot no menu principal"
          },
          types: {
            text: "Texte",
            button: "Bouton",
            list: "Liste",
            helper: "Définit le type d'interface du chatbot"
          },
          ai: {
            title: "Intelligence Artificielle",
            info: "Configurez les fonctionnalités d'IA du chatbot",
            modelHelper: "Choisissez le modèle d'IA à utiliser",
            summarize: "Résumer les conversations",
            summarizeHelper: "Génère automatiquement des résumés des conversations"
          },
          webhook: {
            title: "Webhook",
            url: "URL du webhook",
            urlHelper: "Adresse pour l'envoi d'événements",
            test: "Tester le Webhook",
            testSuccess: "Test réussi",
            testError: "Erreur lors du test du webhook",
            required: "L'URL du webhook est obligatoire",
            invalid: "URL invalide",
            enableN8N: "Activer N8N",
            enableN8NHelper: "Intègre avec la plateforme N8N"
          }
        },
        integrations: {
          title: "Intégrations",
          subtitle: "Gérez les intégrations du système",
          warning: "Configurez les intégrations avec soin",
          enable: "Activer",
          save: "Enregistrer",
        },
        company: {
          title: "Paramètres de l'entreprise",
          subtitle: "Gérez les paramètres de votre entreprise",
          branding: {
            title: "Identité visuelle",
            logo: "Logo",
            background: "Arrière-plan",
            upload: "Envoyer le fichier",
            logoHelper: "Logo de l'entreprise (max. 1 Mo)",
            backgroundHelper: "Image d'arrière-plan (max. 2 Mo)"
          },
          omie: {
            title: "Omie",
            enable: "Activer Omie",
            enableHelper: "Intégrer avec la plateforme Omie",
            appKey: "Clé de l'application",
            appSecret: "Clé secrète",
            info: "Configurer l'intégration avec Omie",
            sync: "Synchroniser",
            syncSuccess: "Synchronisation réussie",
            syncError: "Erreur de synchronisation"
          }
        },
        admin: {
          title: "Paramètres d'administrateur",
          subtitle: "Gérez les paramètres administratifs",
          warning: "Ces paramètres affectent tout le système",
          unauthorized: {
            title: "Accès non autorisé",
            message: "Vous n'avez pas la permission d'accéder à ces paramètres"
          },
          trial: {
            title: "Période d'essai",
            days: "jours",
            helper: "Définit la durée de la période d'essai",
            warning: "Modifier cette valeur affecte les nouveaux enregistrements"
          },
          connections: {
            title: "Connexions",
            enableAll: "Activer toutes les connexions",
            enableAllHelper: "Autorise toutes les connexions dans le système"
          },
          support: {
            title: "Support",
            enable: "Activer le support",
            enableHelper: "Active le système de support",
            phone: "Téléphone de support",
            message: "Message de support",
            test: "Tester le support",
            testSuccess: "Test réussi",
            testError: "Erreur lors du test du support"
          },
          advanced: {
            title: "Avancé",
            warning: "Modifiez ces paramètres avec prudence",
            allowSignup: "Autoriser les enregistrements",
            allowSignupHelper: "Autorise de nouveaux enregistrements dans le système"
          }
        },
        validation: {
          error: "Erreur de validation"
        },
        updateSuccess: "Configuration mise à jour avec succès",
        updateError: "Erreur lors de la mise à jour de la configuration",
        genericError: "Une erreur s'est produite lors du traitement de la demande"
      },
      messagesList: {
        header: {
          assignedTo: "Attribué à:",
          dialogRatingTitle: "Souhaitez-vous laisser une évaluation du service client?",
          dialogClosingTitle: "Clôture de l'assistance!",
          dialogRatingCancel: "Résoudre avec un message de clôture",
          dialogRatingSuccess: "Résoudre et envoyer l'évaluation",
          dialogRatingWithoutFarewellMsg: "Résoudre sans message de clôture",
          ratingTitle: "Choisissez un menu d'évaluation",
          buttons: {
            return: "Retour",
            resolve: "Résoudre",
            reopen: "Rouvrir",
            accept: "Accepter",
            rating: "Envoyer une évaluation"
          }
        },
        confirm: {
          resolveWithMessage: "Envoyer un message de conclusion?",
          yes: "Oui",
          no: "Non"
        }
      },
      messagesInput: {
        recording: {
          tooltip: "Enregistrer un audio"
        },
        attach: "Joindre fichier(s)",
        placeholderOpen: "Entrez un message",
        placeholderClosed: "Rouvrir ou accepter ce ticket pour envoyer un message.",
        signMessage: "Signer",
        invalidFileType: "Type de fichier invalide."
      },
      message: {
        edited: "Éditée",
        deleted: "Message supprimé par le contact"
      },
      contactDrawer: {
        header: "Données de contact",
        buttons: {
          edit: "Modifier le contact"
        },
        extraInfo: "Autres informations"
      },
      fileModal: {
        title: {
          add: "Ajouter une liste de fichiers",
          edit: "Modifier la liste de fichiers"
        },
        buttons: {
          okAdd: "Enregistrer",
          okEdit: "Éditer",
          cancel: "Annuler",
          fileOptions: "Ajouter un fichier"
        },
        form: {
          name: "Nom de la liste de fichiers",
          message: "Détails de la liste",
          fileOptions: "Liste des fichiers",
          extraName: "Message à envoyer avec le fichier",
          extraValue: "Valeur de l'option"
        },
        success: "Liste de fichiers enregistrée avec succès!"
      },
      ticketOptionsMenu: {
        schedule: "Planification",
        delete: "Supprimer",
        transfer: "Transférer",
        registerAppointment: "Remarques du contact",
        resolveWithNoFarewell: "Terminer sans message de clôture",
        acceptAudioMessage: "Autoriser l'audio?",
        appointmentsModal: {
          title: "Remarques du contact",
          textarea: "Remarque",
          placeholder: "Entrez ici les informations que vous souhaitez enregistrer"
        },
        confirmationModal: {
          title: "Supprimer le ticket du contact",
          titleFrom: "Voulez-vous vraiment supprimer le ticket du contact?",
          message: "Attention! Tous les messages liés au ticket seront perdus."
        },
        buttons: {
          delete: "Supprimer",
          cancel: "Annuler"
        }
      },
      confirmationModal: {
        buttons: {
          confirm: "D'accord",
          cancel: "Annuler"
        }
      },
      messageOptionsMenu: {
        delete: "Supprimer",
        reply: "Répondre",
        history: "Historique",
        edit: "Éditer",
        react: "Réagir",
        confirmationModal: {
          title: "Supprimer le message?",
          message: "Cette action ne peut pas être annulée."
        },
        forward: "Sélectionnez pour transférer",
        forwardbutton: "TRANSMETTRE",
        forwardmsg1: "Transférer le message",
        reactions: {
          like: "J'aime",
          love: "Amour",
          haha: "Haha"
        },
        reactionSuccess: "Réaction ajoutée avec succès!"
      },
      forwardModal: {
        title: "Transférer le message",
        fieldLabel: "Sélectionnez ou saisissez un contact",
        buttons: {
          cancel: "Annuler",
          forward: "Transférer"
        }
      },
      inputErrors: {
        tooShort: "Trop court",
        tooLong: "Trop long",
        required: "Obligatoire",
        email: "Adresse e-mail invalide"
      },
      presence: {
        unavailable: "Indisponible",
        available: "Disponible",
        composing: "En train d'écrire...",
        recording: "Enregistrement en cours...",
        paused: "En pause"
      },
      efi: {
        efiSettings: "Paramètres EFI",
        certificate: "Certificat",
        clientId: "Identifiant du client",
        clientSecret: "Secret du Client",
        pixKey: "Clé PIX",
        efiApiConfigInstructions: "Instructions pour configurer l'API EFI",
        fileUploadSuccess: "Fichier envoyé avec succès",
        fileUploadError: "Erreur lors de l'envoi du fichier",
        settingUpdateSuccess: "Configuration mise à jour avec succès",
        efiInstructions: [
          "Accéder au compte EFI",
          "Créez une clé PIX aléatoire, qui sera indiquée dans les paramètres de paiement du système",
          "Dans le menu de gauche, cliquez sur \"API\" et sur \"Créer une application\"",
          "Donnez un nom à l'application (peut être n'importe quel nom, c'est juste pour identifier l'intégration) et cliquez sur continuer",
          "Sur l'écran pour sélectionner les scopes, cliquez sur API Pix pour développer, sélectionnez \"Envoyer PIX\" et sélectionnez tous les éléments, à la fois Production et Homologation",
          "Ensuite, le Client ID et le Secret Key seront générés et doivent être renseignés dans les paramètres de paiement de votre système.",
          "Encore sur l'écran de l'API, sélectionnez \"Mes Certificats\" dans le menu de gauche et cliquez sur \"Créer un nouveau certificat\"",
          "Indiquez un nom pour identifier le certificat et cliquez sur \"Créer un certificat\"",
          "Cliquez sur télécharger le certificat, ce certificat sera également utilisé dans la configuration de votre système."
        ].join("\n")
      },
      assistants: {
        title: "Agents IA",
        searchPlaceholder: "Rechercher des agents...",
        emptyState: {
          title: "Aucun agent trouvé",
          description: "Créez votre premier agent pour commencer à utiliser l'IA dans votre service client."
        },
        status: {
          active: "Actif",
          inactive: "Inactif"
        },
        labels: {
          model: "Modèle",
          tools: "Outils",
          noTools: "Aucun outil configuré",
          none: "Aucun"
        },
        tools: {
          availableTools: "Outils Disponibles",
          fileSearch: "Fichiers",
          codeInterpreter: "Code",
          function: "Fonctions",
          fileSearchFull: "Recherche de Fichiers",
          codeInterpreterFull: "Interpréteur de Code",
          functionFull: "Fonctions Personnalisées",
          fileSearchDescription: "Permet à l'assistant de rechercher et d'utiliser des informations contenues dans des fichiers.",
          codeInterpreterDescription: "Permet à l'assistant d'exécuter du code Python pour l'analyse de données et la génération de graphiques.",
          functionDescription: "Permet à l'assistant d'appeler des fonctions personnalisées pour l'intégration avec des systèmes externes.",
          fileSearchConfig: "Configurez les fichiers dans l'onglet \"Fichiers\".",
          codeInterpreterConfig: "Configurez les fichiers dans l'onglet \"Fichiers\".",
          functionConfig: "Configurez les fonctions dans l'onglet \"Fonctions\"."
        },
        functions: {
          enableFirst: "Activez l'outil \"Fonctions Personnalisées\" dans l'onglet \"Outils\" pour configurer les fonctions."
        },
        tabs: {
          basicSettings: "Paramètres de Base",
          tools: "Outils",
          files: "Fichiers",
          functions: "Fonctions"
        },
        table: {
          name: "Nom",
          model: "Modèle",
          tools: "Outils",
          status: "Statut",
          actions: "Actions"
        },
        form: {
          openaiApiKey: "Clé API OpenAI",
          name: "Nom de l'Agent",
          instructions: "Instructions",
          model: "Modèle",
          active: "Actif",
          activeHelp: "Lorsqu'il est inactif, l'agent ne répondra pas automatiquement",
          toolType: "Type d'Outil",
          toolTypeHelp: "Sélectionnez à quel outil les fichiers seront envoyés",
          addFiles: "Ajouter des Fichiers",
          newFiles: "Nouveaux Fichiers",
          existingFiles: "Fichiers Existants",
          noFiles: "Aucun fichier trouvé"
        },
        filters: {
          allTools: "Tous",
          allModels: "Tous",
          modelLabel: "Modèle",
          toolLabel: "Outil"
        },
        buttons: {
          add: "Ajouter",
          addEmpty: "AJOUTER UN AGENT",
          import: "Importer",
          help: "Aide",
          edit: "Modifier",
          delete: "Supprimer",
          search: "Rechercher",
          cancelSelection: "Annuler la sélection",
          deleteSelected: "Supprimer les sélectionnés",
          cancel: "Annuler",
          okEdit: "Enregistrer les Modifications",
          okAdd: "Ajouter un Agent"
        },
        modal: {
          title: {
            add: "Ajouter un Agent",
            edit: "Modifier un Agent"
          }
        },
        confirmationModal: {
          deleteTitle: "Supprimer l'agent",
          deleteMessage: "Cette action ne peut pas être annulée. Toutes les données associées à cet agent seront définitivement supprimées."
        },
        pagination: {
          showing: "Affichage de {visible} sur {total} agents",
          previous: "Précédent",
          next: "Suivant"
        },
        validation: {
          required: "Obligatoire",
          tooShort: "Trop court!",
          tooLong: "Trop long!"
        },
        toasts: {
          success: "Agent enregistré avec succès",
          deleted: "Agent supprimé avec succès",
          deleteError: "Erreur lors de la suppression de l'agent",
          loadError: "Erreur lors du chargement des agents",
          loadAssistantError: "Erreur lors du chargement des données de l'agent",
          loadFilesError: "Erreur lors du chargement des fichiers de l'agent",
          saveError: "Erreur lors de l'enregistrement de l'agent",
          fileRemoved: "Fichier supprimé avec succès",
          fileRemoveError: "Erreur lors de la suppression du fichier",
          fileSizeExceeded: "La taille totale des fichiers dépasse la limite de 2048KB"
        },
        help: {
          title: "Aide sur les Agents IA",
          common: {
            capabilities: "Capacités",
            supportedFormats: "Formats pris en charge",
            field: "Champ",
            description: "Description"
          },
          tabs: {
            introduction: "Introduction",
            creation: "Création",
            tools: "Outils",
            import: "Importation",
            messageTypes: "Types de Messages"
          },
          introduction: {
            description: "Les Agents IA sont des assistants virtuels basés sur l'Intelligence Artificielle qui peuvent servir automatiquement vos clients.",
            whatAre: {
              title: "Que sont les Agents IA?",
              description: "Les Agents IA utilisent des modèles de langage avancés pour offrir un service automatisé, mais avec des réponses naturelles et personnalisées pour vos clients.",
              benefits: {
                personalization: "Personnalisation complète des réponses et du comportement",
                contextMemory: "Mémoire de contexte pour maintenir des conversations cohérentes",
                tools: "Utilisation d'outils avancés comme la recherche de fichiers et l'analyse de données",
                integration: "Intégration parfaite avec le flux de service existant"
              }
            },
            page: {
              title: "La page des Agents",
              description: "Cette page vous permet de gérer tous vos Agents IA, de la création à la surveillance et à l'édition.",
              sections: {
                creation: "Création d'Agents",
                creationDesc: "Créez de nouveaux assistants personnalisés pour des besoins spécifiques de votre entreprise.",
                import: "Importation",
                importDesc: "Importez des agents déjà configurés dans votre compte OpenAI pour les utiliser ici.",
                search: "Recherche et Filtres",
                searchDesc: "Trouvez rapidement les agents avec des filtres par modèle et outils.",
                management: "Gestion",
                managementDesc: "Modifiez, supprimez ou désactivez des agents selon les besoins."
              }
            },
            models: {
              title: "Modèles Disponibles",
              description: "Choisissez parmi différents modèles d'IA, chacun avec des caractéristiques spécifiques de performance, qualité et coût:",
              gpt4: "Le modèle le plus avancé, avec une plus grande capacité de compréhension et de raisonnement complexe.",
              gpt4turbo: "Version optimisée de GPT-4, offrant un bon équilibre entre qualité et vitesse.",
              gpt35: "Modèle rapide et économique, idéal pour les tâches simples et à haut volume.",
              capabilities: {
                contextual: "Compréhension avancée du contexte",
                reasoning: "Raisonnement complexe",
                code: "Génération de code de haute qualité",
                analysis: "Analyse de données sophistiquée",
                speed: "Vitesse optimisée",
                knowledge: "Connaissances plus récentes",
                costBenefit: "Bon rapport coût-bénéfice",
                versatile: "Idéal pour la plupart des cas d'utilisation",
                maxSpeed: "Vitesse maximale",
                lowCost: "Coût réduit",
                simpleTasks: "Idéal pour les tâches simples",
                highScale: "Parfait pour les grands volumes"
              },
              tip: {
                title: "Conseil pour le choix du modèle",
                description: "Pour la plupart des cas, GPT-4 Turbo offre le meilleur équilibre entre qualité et coût. Utilisez GPT-4 pour les cas nécessitant un raisonnement plus sophistiqué et GPT-3.5 pour les tâches simples en grand volume."
              }
            }
          },
          creation: {
            title: "Création d'un Agent",
            description: "Le processus de création d'un agent implique quelques étapes simples mais importantes pour le bon fonctionnement de l'assistant.",
            stepsTitle: "Étapes de création",
            steps: {
              one: {
                title: "Démarrer le processus",
                description: "Cliquez sur le bouton 'Ajouter' en haut de la page des Agents pour ouvrir le formulaire de création."
              },
              two: {
                title: "Paramètres de base",
                description: "Remplissez les informations essentielles pour le fonctionnement de l'agent:",
                fields: {
                  apiKey: "Clé API OpenAI",
                  apiKeyDesc: "Votre clé API personnelle OpenAI pour l'authentification des services.",
                  name: "Nom",
                  nameDesc: "Un nom d'identification pour l'agent, visible uniquement par vous.",
                  instructions: "Instructions",
                  instructionsDesc: "Directives détaillées qui définissent le comportement, le ton et les connaissances de l'agent.",
                  model: "Modèle",
                  modelDesc: "Le modèle d'IA à utiliser, qui définit les capacités et les coûts de l'agent."
                }
              },
              three: {
                title: "Activer les outils",
                description: "Choisissez les outils que vous souhaitez mettre à disposition de votre agent:",
                tools: {
                  fileSearch: "Recherche de Fichiers",
                  codeInterpreter: "Interpréteur de Code",
                  functions: "Fonctions Personnalisées"
                },
                note: "Chaque outil ajoute des capacités spécifiques et peut nécessiter des configurations supplémentaires."
              },
              four: {
                title: "Enregistrer l'agent",
                description: "Cliquez sur 'Ajouter un Agent' pour finaliser la création. L'agent sera immédiatement disponible pour utilisation."
              }
            },
            tips: {
              title: "Conseils pour créer des agents efficaces",
              instructionsQuality: "Fournissez des instructions détaillées et claires pour obtenir des réponses plus précises et dans le ton souhaité.",
              specificPurpose: "Créez des agents avec des objectifs spécifiques plutôt qu'un seul agent générique pour toutes les tâches.",
              testIteratively: "Testez régulièrement le comportement de l'agent et ajustez les instructions si nécessaire."
            }
          },
          tools: {
            title: "Outils Disponibles",
            description: "Les agents peuvent utiliser des outils spéciaux qui étendent leurs capacités au-delà de la simple conversation textuelle.",
            fileSearch: {
              title: "Recherche de Fichiers",
              description: "Permet à l'agent de rechercher des informations dans les documents téléchargés pour répondre aux questions basées sur leur contenu.",
              capabilities: {
                retrieveInfo: "Récupère des informations spécifiques des documents",
                answerQuestions: "Répond aux questions basées sur le contenu des fichiers",
                summarize: "Crée des résumés et des synthèses de documents volumineux"
              }
            },
            codeInterpreter: {
              title: "Interpréteur de Code",
              description: "Permet à l'agent d'exécuter du code Python pour l'analyse de données, les calculs et la génération de visualisations.",
              capabilities: {
                executeCode: "Exécute du code Python pour l'analyse de données",
                dataAnalysis: "Réalise des analyses statistiques et mathématiques",
                visualizations: "Génère des graphiques et des visualisations de données"
              }
            },
            functions: {
              title: "Fonctions Personnalisées",
              description: "Permet à l'agent d'exécuter des actions spécifiques via des fonctions définies, comme l'intégration avec des systèmes externes.",
              capabilities: {
                integration: "Intégration avec des systèmes et API externes",
                realTime: "Accès aux données en temps réel",
                actions: "Exécution d'actions spécifiques à l'entreprise"
              }
            },
            configuration: {
              title: "Configuration des Outils",
              description: "Chaque outil nécessite des configurations spécifiques pour son bon fonctionnement:",
              fileSearch: {
                title: "Configuration de la Recherche de Fichiers",
                step1: "Activez l'outil 'Recherche de Fichiers' dans l'onglet Outils.",
                step2: "Allez dans l'onglet 'Fichiers' et sélectionnez 'Recherche de Fichiers' dans le type d'outil.",
                step3: "Ajoutez les fichiers que vous souhaitez mettre à disposition pour consultation par l'agent."
              },
              codeInterpreter: {
                title: "Configuration de l'Interpréteur de Code",
                step1: "Activez l'outil 'Interpréteur de Code' dans l'onglet Outils.",
                step2: "Allez dans l'onglet 'Fichiers' et sélectionnez 'Interpréteur de Code' dans le type d'outil.",
                libraries: "L'environnement Python inclut par défaut des bibliothèques populaires comme pandas, numpy, matplotlib et scikit-learn."
              },
              functions: {
                title: "Configuration des Fonctions Personnalisées",
                step1: "Activez l'outil 'Fonctions Personnalisées' dans l'onglet Outils.",
                step2: "Allez dans l'onglet 'Fonctions' et ajoutez les fonctions que vous souhaitez mettre à disposition de l'agent.",
                parameters: {
                  title: "Configuration des Paramètres",
                  name: "Nom",
                  nameDesc: "Nom de la fonction que l'agent appellera",
                  description: "Description",
                  descriptionDesc: "Explication de ce que fait la fonction et quand elle doit être utilisée",
                  type: "Type",
                  typeDesc: "Type de données du paramètre (chaîne, nombre, booléen, etc.)",
                  required: "Obligatoire",
                  requiredDesc: "Indique si le paramètre est obligatoire ou optionnel"
                }
              }
            },
            limitations: {
              title: "Limitations",
              description: "Les outils présentent quelques limitations importantes à considérer: l'Interpréteur de Code fonctionne dans un environnement isolé sans accès à Internet, la Recherche de Fichiers prend en charge un nombre limité de formats, et les Fonctions Personnalisées nécessitent une configuration supplémentaire pour une implémentation efficace."
            }
          },
          import: {
            title: "Importation d'Agents",
            description: "Vous pouvez importer des agents existants de votre compte OpenAI pour les utiliser dans le système.",
            processTitle: "Processus d'Importation",
            steps: {
              one: {
                title: "Démarrer l'importation",
                description: "Cliquez sur le bouton 'Importer' en haut de la page des Agents pour ouvrir l'assistant d'importation.",
                note: "Vous aurez besoin de votre clé API OpenAI pour compléter ce processus."
              },
              two: {
                title: "Sélectionner les agents",
                description: "Le système affichera tous les agents disponibles dans votre compte OpenAI. Sélectionnez ceux que vous souhaitez importer."
              },
              three: {
                title: "Terminer l'importation",
                description: "Cliquez sur 'Importer les Sélectionnés' pour finaliser le processus. Les agents importés apparaîtront dans votre liste.",
                note: "Certains éléments comme les fichiers et les fonctions spécifiques peuvent nécessiter une reconfiguration après l'importation."
              }
            },
            advantages: {
              title: "Avantages de l'Importation",
              time: "Économise du temps en réutilisant des agents déjà configurés dans OpenAI",
              consistency: "Maintient la cohérence entre les agents utilisés sur la plateforme OpenAI et dans le système",
              migration: "Facilite la migration progressive vers notre système intégré"
            },
            limitations: {
              title: "Limitations de l'Importation",
              description: "Il existe quelques limitations importantes à considérer dans le processus d'importation:",
              files: {
                title: "Fichiers",
                description: "Les fichiers associés aux agents dans OpenAI ne sont pas importés automatiquement et doivent être ajoutés à nouveau."
              },
              keys: {
                title: "Clés API",
                description: "Vous devrez fournir à nouveau votre clé API pour chaque agent, même s'ils utilisent tous la même clé."
              },
              functions: {
                title: "Fonctions",
                description: "Les fonctions personnalisées devront être reconfigurées manuellement après l'importation."
              }
            },
            security: {
              title: "Sécurité",
              description: "Votre clé API OpenAI est utilisée uniquement pour le processus d'importation et l'interaction avec les agents. Elle est stockée de manière sécurisée et cryptée dans notre système."
            }
          },
          messageTypes: {
            title: "Types de Messages Pris en Charge",
            description: "L'agent peut envoyer différents types de messages au-delà du simple texte. Découvrez ci-dessous les formats pris en charge et comment les utiliser.",
            text: {
              title: "Message Texte",
              description: "Les messages texte simples sont envoyés automatiquement. L'agent peut répondre avec des paragraphes, des listes et une mise en forme de base.",
              example: "Exemple:",
              exampleText: "Bonjour! Comment puis-je vous aider aujourd'hui?"
            },
            location: {
              title: "Localisation (Carte)",
              description: "Envoyez des coordonnées géographiques pour afficher un emplacement sur la carte.",
              example: "Format:"
            },
            document: {
              title: "Documents",
              description: "Envoyez des documents tels que PDF, DOC, XLS et autres formats de fichiers.",
              example: "Format:"
            },
            video: {
              title: "Vidéos",
              description: "Partagez des vidéos à partir d'URLs externes.",
              example: "Format:"
            },
            contact: {
              title: "Contacts",
              description: "Partagez des informations de contact qui peuvent être enregistrées dans le carnet d'adresses de l'utilisateur.",
              example: "Format:"
            },
            audio: {
              title: "Audios",
              description: "Envoyez des messages vocaux ou audio à partir d'URLs externes.",
              example: "Format:"
            },
            image: {
              title: "Images",
              description: "Partagez des images à partir d'URLs externes ou générées par l'agent.",
              example: "Format:"
            },
            tips: {
              title: "Conseils pour l'utilisation des messages",
              description: "Pour utiliser ces fonctionnalités, incluez des commandes spéciales dans les instructions de votre agent. Les commandes doivent être formatées exactement comme indiqué dans les exemples ci-dessus. Plusieurs commandes peuvent être combinées dans une seule réponse."
            }
          }
        }
      },
      newapi: {
        title: "API Playground",
        helpButton: "Aide",
        helpTooltip: "Voir la documentation détaillée de l'API",
        selectRoute: "Sélectionnez une route :",
        selectLanguage: "Langage :",
        replaceToken: "Remplacez (VOTRE_TOKEN_ICI) par votre token d'authentification.",
        method: "Méthode",
        endpoint: "Endpoint",
        pathParamsInfo: "* Les paramètres de chemin indiqués entre accolades {param} seront remplacés par les valeurs correspondantes.",
        steps: {
          selectRoute: "Sélectionner une Route",
          generateCode: "Générer le Code",
          testApi: "Tester l'API"
        },
        tabs: {
          select: "Sélectionner",
          generate: "Générer le Code",
          test: "Tester l'API"
        },
        languages: {
          javascript: "JavaScript",
          python: "Python",
          php: "PHP"
        },
        buttons: {
          send: "Envoyer",
          delete: "Supprimer",
          close: "Fermer"
        },
        success: {
          requestSuccessful: "Requête effectuée avec succès !"
        },
        errors: {
          requestError: "Erreur de requête :",
          processingError: "Erreur lors du traitement de la requête",
          serverError: "Erreur",
          noResponse: "Impossible de se connecter au serveur. Vérifiez votre connexion.",
          unknownServerError: "Erreur inconnue du serveur"
        },
        warnings: {
          noToken: "Aucun token d'authentification détecté. Vous devez avoir un WhatsApp connecté ou fournir un token manuellement."
        },
        formValidation: {
          required: "Le champ {field} est obligatoire",
          invalidEmail: "Email invalide",
          mustBeNumber: "Doit être un nombre",
          onlyNumbers: "Format invalide. Seuls les chiffres sont autorisés."
        },
        codeBlock: {
          copied: "Code copié dans le presse-papiers !",
          copyToClipboard: "Copier dans le presse-papiers"
        },
        help: {
          title: "Documentation de l'API AutoAtende",
          introduction: "L'API AutoAtende vous permet d'intégrer des fonctionnalités de messagerie, de tickets, de contacts et d'autres fonctionnalités dans vos applications. Toutes les requêtes nécessitent une authentification via token dans l'en-tête Authorization.",
          authTitle: "Authentification",
          authDescription: "Toutes les requêtes à l'API doivent inclure un token d'authentification dans l'en-tête Authorization, au format Bearer token. Vous pouvez obtenir le token dans les paramètres WhatsApp du panneau AutoAtende.",
          authExample: "Exemple de comment inclure le token dans l'en-tête :",
          closeButton: "Fermer",
          parametersTitle: "Paramètres",
          responsesTitle: "Réponses",
          exampleTitle: "Exemple",
          required: "obligatoire",
          noParameters: "Cette route ne nécessite pas de paramètres supplémentaires.",
          noResponsesSpecified: "Aucun détail spécifique sur les réponses pour cette route.",
          categories: {
            messages: "Messages",
            tickets: "Tickets",
            contacts: "Contacts",
            companies: "Entreprises",
            invoices: "Factures",
            dashboard: "Tableau de bord"
          },
          messagesDescription: "Endpoints pour l'envoi de messages, de fichiers et la vérification des numéros sur WhatsApp.",
          ticketsDescription: "Endpoints pour la gestion des tickets (création, mise à jour, fermeture et listage).",
          contactsDescription: "Endpoints pour la gestion des contacts (création, mise à jour, suppression et listage).",
          companiesDescription: "Endpoints pour la gestion des entreprises (création, mise à jour et blocage).",
          invoicesDescription: "Endpoints pour la consultation des factures.",
          dashboardDescription: "Endpoints pour l'obtention de données statistiques et de métriques du système.",
          endpoints: {
            sendMessage: {
              description: "Envoie un message texte à un numéro WhatsApp. Peut inclure des fichiers médias.",
              params: {
                number: "Numéro du destinataire (incluant le code du pays et l'indicatif régional, sans caractères spéciaux)",
                body: "Contenu du message",
                medias: "Fichiers médias à envoyer (optionnel)",
                queueId: "ID de la file pour associer le ticket",
                status: "Statut souhaité pour le ticket après envoi (open, pending ou closed)"
              },
              responses: {
                200: "Message envoyé avec succès",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur du serveur"
              },
              exampleTitle: "Exemple d'envoi de message avec fichier :",
              exampleComment: "Pour envoyer un fichier, décommentez les lignes ci-dessous :"
            },
            sendPdfLink: {
              description: "Envoie un message avec un lien vers un fichier PDF.",
              params: {
                number: "Numéro du destinataire (incluant le code du pays et l'indicatif régional, sans caractères spéciaux)",
                url: "URL du PDF à envoyer",
                caption: "Légende à envoyer avec le lien"
              },
              responses: {
                200: "Lien vers le PDF envoyé avec succès",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur du serveur"
              },
              exampleTitle: "Exemple d'envoi de lien vers un PDF :"
            },
            sendImageLink: {
              description: "Envoie un message avec un lien vers une image.",
              params: {
                number: "Numéro du destinataire (incluant le code du pays et l'indicatif régional, sans caractères spéciaux)",
                url: "URL de l'image à envoyer",
                caption: "Légende à envoyer avec l'image"
              },
              responses: {
                200: "Lien vers l'image envoyé avec succès",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur du serveur"
              }
            },
            checkNumber: {
              description: "Vérifie si un numéro est valide et enregistré sur WhatsApp.",
              params: {
                number: "Numéro à vérifier (incluant le code du pays et l'indicatif régional, sans caractères spéciaux)"
              },
              responses: {
                200: "Numéro vérifié avec succès",
                400: "Numéro invalide ou non trouvé sur WhatsApp",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            internalMessage: {
              description: "Crée un message interne dans un ticket existant sans l'envoyer sur WhatsApp.",
              params: {
                ticketId: "ID du ticket où le message sera ajouté",
                body: "Contenu du message interne",
                medias: "Fichiers médias à joindre (optionnel)"
              },
              responses: {
                200: "Message interne créé avec succès",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur du serveur"
              }
            },
            createTicket: {
              description: "Crée un nouveau ticket associé à un contact.",
              params: {
                contactId: "ID du contact à associer au ticket",
                status: "Statut initial du ticket (open, pending, closed)",
                userId: "ID de l'utilisateur responsable du ticket (optionnel)",
                queueId: "ID de la file à associer au ticket (optionnel)",
                whatsappId: "ID du WhatsApp à utiliser (optionnel)"
              },
              responses: {
                201: "Ticket créé avec succès",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur du serveur"
              }
            },
            closeTicket: {
              description: "Change le statut d'un ticket à 'fermé'.",
              params: {
                ticketId: "ID du ticket à fermer"
              },
              responses: {
                200: "Ticket fermé avec succès",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur du serveur"
              }
            },
            updateQueueTicket: {
              description: "Met à jour la file associée à un ticket spécifique.",
              params: {
                ticketId: "ID du ticket à mettre à jour",
                queueId: "ID de la nouvelle file pour le ticket"
              },
              responses: {
                200: "File du ticket mise à jour avec succès",
                400: "File invalide ou n'appartient pas à l'entreprise",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            addTagToTicket: {
              description: "Associe une étiquette spécifique à un ticket.",
              params: {
                ticketId: "ID du ticket à mettre à jour",
                tagId: "ID de l'étiquette à ajouter au ticket"
              },
              responses: {
                200: "Étiquette ajoutée au ticket avec succès",
                400: "Étiquette invalide ou déjà associée au ticket",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            removeTagFromTicket: {
              description: "Supprime l'association entre une étiquette et un ticket.",
              params: {
                ticketId: "ID du ticket duquel l'étiquette sera supprimée",
                tagId: "ID de l'étiquette à supprimer"
              },
              responses: {
                200: "Étiquette supprimée du ticket avec succès",
                400: "L'étiquette n'est pas associée au ticket",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            listTickets: {
              description: "Renvoie la liste des tickets associés à l'entreprise du token.",
              params: {
                companyId: "ID de l'entreprise (optionnel, sera obtenu à partir du token si non fourni)"
              },
              responses: {
                200: "Tickets listés avec succès",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            listTicketsByTag: {
              description: "Renvoie les tickets qui ont une étiquette spécifique.",
              params: {
                tagId: "ID de l'étiquette pour filtrer les tickets"
              },
              responses: {
                200: "Tickets listés avec succès",
                400: "Étiquette invalide ou n'appartient pas à l'entreprise",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            createPBXTicket: {
              description: "Crée un ticket interne basé sur les informations d'un appel téléphonique.",
              params: {
                phoneNumber: "Numéro de téléphone du contact",
                contactName: "Nom du contact (utilisé si le contact n'existe pas)",
                status: "Statut initial du ticket (open, pending, closed)",
                ramal: "Numéro de poste qui a répondu/initié l'appel",
                idFilaPBX: "ID de la file dans le système PBX",
                message: "Message interne à ajouter au ticket",
                medias: "Fichiers médias à ajouter au ticket"
              },
              responses: {
                201: "Ticket PBX créé avec succès",
                400: "Paramètres invalides ou manquants",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            getTicketHistory: {
              description: "Renvoie les tickets avec leurs messages dans une plage de dates.",
              params: {
                startDate: "Date de début (YYYY-MM-DD)",
                endDate: "Date de fin (YYYY-MM-DD)",
                contactNumber: "Numéro de contact pour filtrer (optionnel)"
              },
              responses: {
                200: "Historique des tickets obtenu avec succès",
                400: "Paramètres invalides",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            listContacts: {
              description: "Renvoie la liste des contacts associés à l'entreprise du token.",
              params: {
                companyId: "ID de l'entreprise (optionnel, sera obtenu à partir du token si non fourni)"
              },
              responses: {
                200: "Contacts listés avec succès",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            searchContacts: {
              description: "Renvoie une liste paginée de contacts avec option de filtrage par terme de recherche.",
              params: {
                searchParam: "Terme pour la recherche dans le nom ou le numéro du contact",
                pageNumber: "Numéro de page pour la pagination",
                companyId: "ID de l'entreprise (optionnel, sera obtenu à partir du token si non fourni)"
              },
              responses: {
                200: "Contacts listés avec succès",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur du serveur"
              }
            },
            createCompany: {
              description: "Crée une nouvelle entreprise avec les données fournies.",
              params: {
                name: "Nom de l'entreprise",
                email: "Email principal de l'entreprise",
                phone: "Téléphone de contact de l'entreprise",
                status: "Statut actif/inactif de l'entreprise"
              },
              responses: {
                200: "Entreprise créée avec succès",
                400: "Erreur de validation",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            updateCompany: {
              description: "Met à jour les données d'une entreprise existante.",
              params: {
                id: "ID de l'entreprise à mettre à jour",
                name: "Nom de l'entreprise",
                email: "Email principal de l'entreprise",
                phone: "Téléphone de contact de l'entreprise",
                status: "Statut actif/inactif de l'entreprise"
              },
              responses: {
                200: "Entreprise mise à jour avec succès",
                400: "Erreur de validation",
                401: "Non autorisé - Token invalide ou absent",
                404: "Entreprise non trouvée"
              }
            },
            blockCompany: {
              description: "Définit le statut d'une entreprise comme inactif (bloqué).",
              params: {
                companyId: "ID de l'entreprise à bloquer"
              },
              responses: {
                200: "Entreprise bloquée avec succès",
                401: "Non autorisé - Token invalide ou absent",
                404: "Entreprise non trouvée"
              }
            },
            listInvoices: {
              description: "Renvoie la liste des factures associées à l'entreprise du token.",
              params: {
                companyId: "ID de l'entreprise (optionnel, sera obtenu à partir du token si non fourni)"
              },
              responses: {
                200: "Factures listées avec succès",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            getInvoice: {
              description: "Renvoie les détails d'une facture spécifique.",
              params: {
                Invoiceid: "ID de la facture à afficher"
              },   
              responses: {
                200: "Détails de la facture obtenus avec succès",
                401: "Non autorisé - Token invalide ou absent"
              }
            },
            getDashboardOverview: {
              description: "Renvoie les métriques et les données statistiques pour le tableau de bord.",
              params: {
                period: "Période pour l'analyse ('day', 'week' ou 'month')",
                date: "Date de référence (YYYY-MM-DD)",
                userId: "ID de l'utilisateur pour filtrer (optionnel)",
                queueId: "ID de la file pour filtrer (optionnel)"
              },
              responses: {
                200: "Données du tableau de bord obtenues avec succès",
                400: "Erreur de validation",
                401: "Non autorisé - Token invalide ou absent",
                500: "Erreur interne du serveur"
              },
              exampleTitle: "Exemple d'obtention des données du tableau de bord :"
            }
          }
        }
      },  
      pagination: {
        itemsPerPage: "{{count}} par page",
        itemsPerPageTooltip: "Sélectionnez le nombre d'éléments à afficher par page. Cela aide à contrôler la quantité d'informations affichées en une seule fois."
      },
      invoices: {
        title: "Factures",
        search: "Rechercher des factures...",
        toggleView: "Basculer la vue",
        id: "ID",
        details: "Détails",
        value: "Valeur",
        dueDate: "Date d'échéance",
        status: "Statut",
        actions: "Actions",
        pay: "Payer",
        paid: "Payé",
        pending: "Ouvert",
        overdue: "En retard",
        editDueDate: "Modifier la date d'échéance",
        newDueDate: "Nouvelle date d'échéance",
        updating: "Mise à jour en cours...",
        confirm: "Confirmer",
        cancel: "Annuler",
        sendWhatsapp: "Envoyer par WhatsApp",
        sendEmail: "Envoyer par Email",
        dueDateUpdated: "Date d'échéance mise à jour avec succès",
        errorUpdatingDueDate: "Erreur lors de la mise à jour de la date d'échéance",
        messageSent: "Message envoyé avec succès",
        messageError: "Erreur lors de l'envoi du message",
        emailSent: "Email envoyé avec succès",
        emailError: "Erreur lors de l'envoi de l'email",
        loadError: "Erreur lors du chargement des factures",
        emailSubject: "Facture #${id}",
        superUserOnly: "Seuls les super utilisateurs peuvent effectuer cette action",
        whatsappMessage: {
          header: "Détails de la facture",
          id: "Numéro de la facture",
          dueDate: "Date d'échéance",
          value: "Valeur",
          paymentInfo: "Informations de paiement",
          footer: "En cas de doute, veuillez nous contacter"
        },
        emailBody: {
          header: "Détails de votre facture",
          id: "Numéro de la facture",
          dueDate: "Date d'échéance",
          value: "Valeur",
          paymentInstructions: "Instructions de paiement",
          footer: "Nous vous remercions de votre préférence"
        },
        cardView: {
          dueIn: "Échéance dans",
          overdueDays: "En retard depuis",
          days: "jours"
        }
      },
      financial: {
        title: "Financier",
        selectCompany: "Sélectionner l'entreprise",
        allCompanies: "Toutes les entreprises",
        company: "Entreprise",
        value: "Valeur",
        dueDate: "Échéance",
        invalidDate: "Date invalide",
        dueDateRequired: "La date d'échéance est obligatoire",
        dueDateFuture: "La date doit être future",
        dateNotInformed: "Date non renseignée",
        viewInvoice: "Voir la facture",
        from: "De",
        to: "Pour",
        description: "Description",
        payOnline: "Payez en ligne via PIX",
        terms: "Cette facture a été générée automatiquement. Pour plus d'informations, veuillez nous contacter.",
        status: {
          tableHeader: "Statut",
          allStatus: "Tous les statuts",
          paid: "Payé",
          pending: "En attente",
          open: "En attente",
          overdue: "En retard"
        },
        actions: "Actions",
        editDueDate: "Modifier la date d'échéance",
        sendEmail: "Envoyer un e-mail",
        sendWhatsapp: "Envoyer par WhatsApp",
        deleteInvoice: "Supprimer la facture",
        payInvoice: "Payer la facture",
        pay: "Payer",
        confirmDelete: "Confirmer la suppression",
        deleteWarning: "Cette action ne peut pas être annulée.",
        deleteConfirmation: "Êtes-vous sûr de vouloir supprimer cette facture ?",
        invoice: "Facture",
        newDueDate: "Nouvelle date d'échéance",
        cancel: "Annuler",
        confirm: "Confirmer",
        dueDateUpdated: "Date d'échéance mise à jour avec succès",
        invoiceDeleted: "Facture supprimée avec succès",
        emailSent: "Email envoyé avec succès",
        whatsappSent: "Message WhatsApp envoyé avec succès",
        errorLoadingCompanies: "Erreur lors du chargement des entreprises",
        errorLoadingInvoices: "Erreur lors du chargement des factures",
        errorUpdatingDueDate: "Erreur lors de la mise à jour de la date d'échéance",
        errorDeletingInvoice: "Erreur lors de la suppression de la facture",
        errorSendingEmail: "Erreur lors de l'envoi de l'email",
        errorSendingWhatsapp: "Erreur lors de l'envoi du message WhatsApp",
        noCompanyAccess: "L'utilisateur n'a pas d'entreprise associée",
        noInvoices: "Aucune facture trouvée",
        accessDenied: "Accès non autorisé",
        superUserIndicator: "Super utilisateur",
        emitter: "Émetteur",
        recipient: "Destinataire",
        invoiceNumber: "Facture n°{{number}}",
        tableInvoice: "Facture #",
        companyLogo: "Logo de l'entreprise",
        closeModal: "Fermer la fenêtre modale",
        errorLoadingCompany: "Erreur lors du chargement des données de l'entreprise",
        loading: "Chargement...",
        companyDetails: "Détails de l'entreprise",
        paymentInstructions: "Instructions de paiement",
        generatedAt: "Généré le",
        payWithPix: "Payer avec PIX",
        pixCode: "Code PIX (cliquez pour copier)",
        pixCopied: "Code PIX copié !",
        scanQrCode: "Scanner le code QR",
        copyPixCode: "Copier le code PIX",
        filterStatus: "Statut",
        allStatus: "Tous les statuts"
      },
      deleteConfirmationDialog: {
        cancelButton: "Annuler",
        confirmButton: "Confirmer la suppression",
        defaultTitle: "Confirmer la suppression",
        defaultWarning: "Cette action ne peut pas être annulée !",
        defaultConfirmation: "Êtes-vous sûr de vouloir supprimer cet élément ?"
      },
      errors: {
        required: "Ce champ est obligatoire",
        invalid: "Valeur invalide",
        invalidEmail: "Email invalide",
        invalidPhone: "Téléphone invalide",
        invalidCep: "Code postal invalide",
        invalidCpf: "CPF invalide",
        invalidCnpj: "CNPJ invalide",
        minLength: "Minimum de {min} caractères",
        maxLength: "Maximum de {max} caractères"
      },
      modal: {
        scheduling: {
          title: "Heure de rendez-vous",
          description: "Toutes les planifications seront envoyées entre 18h00 et 18h30."
        },
        recurring: {
          title: "Rendez-vous récurrent",
          steps: {
            intro: "Suivez ces étapes:",
            step1: "Allez à l'onglet des Tags de Campagne",
            step2: "Créez de nouveaux tags, si nécessaire",
            substeps: {
              title: "Configurez votre campagne :",
              settings: "Allez dans l'engrenage des paramètres",
              board: "Sélectionnez l'un des tableaux disponibles",
              message: "Modifiez le message qui sera envoyé",
              file: "Si nécessaire, choisissez un fichier à envoyer",
              frequency: "Choisissez la fréquence du rendez-vous (tous les combien de jours)",
              save: "Cliquez sur Enregistrer"
            }
          }
        },
        openTickets: {
          title: "Tickets sans campagnes actives",
          description: "Tous les tickets sans campagnes actives seront placés dans le tableau \"En cours\""
        },
        campaign: {
          title: "Créer une campagne",
          description: "Pour créer une campagne, faites glisser le ticket vers le tableau de campagne de votre choix"
        },
        moving: {
          title: "Déplacer les tickets entre les tableaux",
          rules: {
            rule1: "Lorsque vous déplacez un ticket vers un tableau, les rendez-vous seront planifiés en fonction des paramètres du tableau",
            rule2: "Lorsque vous déplacez un ticket vers un autre tableau, les rendez-vous existants seront supprimés et un nouveau rendez-vous sera créé en fonction du tableau choisi",
            rule3: "Lorsque vous déplacez un ticket de retour dans le tableau \"En cours\", les rendez-vous existants du ticket seront supprimés"
          }
        },
        close: "Fermer la fenêtre modale"
      },
      splash: {
        title: "AutoRépondant",
        subtitle: "Service Client Intelligent",
        loading: "Chargement...",
        initializing: "Démarrage...",
        loadingResources: "Chargement des ressources...",
        preparingInterface: "Préparation de l'interface...",
        configuringEnvironment: "Configuration de l'environnement...",
        finishingUp: "Finalisation..."
      },
      home: {
        nav: {
          features: "Fonctionnalités",
          pricing: "Prix",
          about: "À Propos",
          login: "Se connecter",
          getStarted: "Commencer Maintenant"
        },
        hero: {
          title: "Transformez votre Service Client avec l'IA",
          subtitle: "Automatisez, optimisez et mettez à l'échelle votre service client avec des solutions intelligentes basées sur l'intelligence artificielle.",
          cta: {
            primary: "Essai Gratuit",
            secondary: "En Savoir Plus"
          }
        },
        stats: {
          clients: "Clients Actifs",
          uptime: "Disponibilité",
          support: "Support Client"
        },
        features: {
          title: "Fonctionnalités Puissantes",
          subtitle: "Tout ce dont vous avez besoin pour offrir un service exceptionnel",
          chatbot: {
            title: "Chatbot avec IA",
            description: "Réponses automatisées intelligentes avec traitement avancé du langage naturel."
          },
          messaging: {
            title: "Messages Unifiés",
            description: "Gérez toutes les conversations avec vos clients sur une seule plateforme centralisée."
          },
          ai: {
            title: "Analyse avec IA",
            description: "Obtenez des informations approfondies sur les interactions avec les clients et la performance du service."
          },
          automation: {
            title: "Automatisation Intelligente",
            description: "Automatisez les tâches routinières et concentrez-vous sur ce qui compte vraiment."
          },
          security: {
            title: "Sécurité d'Entreprise",
            description: "Sécurité et protection des données de niveau bancaire pour votre tranquillité."
          },
          api: {
            title: "API pour Développeurs",
            description: "Intégrez facilement avec vos systèmes et flux de travail existants."
          }
        },
        pricing: {
          title: "Prix Simples et Transparent",
          subtitle: "Choisissez le plan qui répond le mieux à vos besoins",
          popularLabel: "Le Plus Populaire",
          ctaButton: "Commencer Maintenant",
          basic: {
            title: "Basique",
            feature1: "1 Opérateur",
            feature2: "1 Canal WhatsApp",
            feature3: "Tableau de Bord Basique",
            feature4: "Support par Email"
          },
          pro: {
            title: "Professionnel",
            feature1: "5 Opérateurs",
            feature2: "3 Canaux WhatsApp",
            feature3: "Analyses Avancées",
            feature4: "Support Prioritaire"
          },
          enterprise: {
            title: "Entreprise",
            feature1: "Opérateurs Illimités",
            feature2: "Canaux illimités",
            feature3: "Intégration personnalisée",
            feature4: "Assistance 24/7"
          }
        },
        footer: {
          description: "AutoAtende aide les entreprises à offrir un service exceptionnel grâce à l'automatisation avec intelligence artificielle.",
          product: {
            title: "Produit",
            features: "Fonctionnalités",
            pricing: "Prix",
            api: "API"
          },
          company: {
            title: "Entreprise",
            about: "À propos de nous",
            contact: "Contact",
            careers: "Carrières"
          },
          legal: {
            title: "Légal",
            privacy: "Politique de confidentialité",
            terms: "Conditions d'utilisation",
            cookies: "Politique de cookies"
          },
          rights: "Tous droits réservés."
        }
      },
      connections: {
        title: "Connexions",
        noConnections: "Aucune connexion trouvée",
        buttons: {
          add: "Ajouter une connexion",
          restartAll: "Redémarrer tout",
          qrCode: "Voir le code QR",
          tryAgain: "Réessayer",
          disconnect: "Déconnecter",
          newQr: "Nouveau code QR",
          connecting: "Connexion en cours...",
          refreshQrCode: "Mettre à jour le code QR",
          generatingQrCode: "Génération du code QR en cours...",
          generateQrCode: "Générer un code QR",
          showQrCode: "Afficher le code QR"
        },
        status: {
          disconnected: "Déconnecté"
        },
        menu: {
          duplicate: "Dupliquer la connexion",
          transferTickets: "Transférer des tickets et supprimer",
          delete: "Supprimer la connexion",
          forceDelete: "Forcer la suppression",
          importMessages: "Importer des messages"
        },
        confirmationModal: {
          deleteTitle: "Supprimer la connexion",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer cette connexion ? Tous les services associés seront perdus.",
          disconnectTitle: "Déconnecter la session",
          disconnectMessage: "Êtes-vous sûr de vouloir déconnecter cette session ?",
          forceDeleteTitle: "Forcer la suppression",
          forceDeleteMessage: "ATTENTION : Cette action supprimera la connexion même s'il y a des tickets ouverts. Êtes-vous sûr ?",
          transferTitle: "Transférer des tickets",
          transferMessage: "Sélectionnez la connexion de destination pour les tickets :"
        },
        toasts: {
          deleted: "Connexion supprimée avec succès.",
          deleteError: "Erreur lors de la suppression de la connexion.",
          disconnected: "Connexion déconnectée avec succès.",
          disconnectError: "Erreur lors de la déconnexion de la connexion.",
          qrCodeGenerated: "Code QR généré avec succès.",
          qrCodeError: "Erreur lors de la génération du code QR.",
          reconnectRequested: "Reconnexion demandée avec succès.",
          reconnectError: "Erreur lors de la demande de reconnexion.",
          connectionStarted: "Démarrage de la session...",
          startError: "Erreur de démarrage de session.",
          fetchError: "Erreur lors de la recherche de connexions.",
          restartSuccess: "Toutes les connexions sont en cours de redémarrage.",
          duplicated: "Connexion dupliquée avec succès.",
          duplicateError: "Erreur lors de la duplication de la connexion.",
          transferSuccess: "Tickets transférés et connexion supprimée avec succès.",
          transferError: "Erreur lors du transfert des tickets."
        },
        table: {
          name: "Nom",
          number: "Numéro",
          status: "Statut",
          default: "Modèle",
          lastUpdate: "Dernière mise à jour",
          session: "Session",
          actions: "Actions"
        },
        import: {
          title: "Importation de messages",
          preparingImport: "Préparation de l'importation...",
          pleaseWait: "Veuillez patienter pendant que nous préparons les données pour l'importation.",
          importingMessages: "Importation des messages",
          progress: "Progrès",
          doNotClose: "Ne fermez pas cette fenêtre pendant l'importation en cours.",
          importComplete: "Importation terminée",
          messagesImported: "{count} messages ont été importés avec succès.",
          closeTicketsTitle: "Fermer les tickets importés",
          closeTicketsDescription: "Vous pouvez automatiquement fermer tous les tickets créés pendant l'importation pour maintenir votre espace de travail organisé.",
          closeTicketsButton: "Fermer les tickets importés",
          importError: "Erreur lors de l'importation",
          genericError: "Une erreur s'est produite lors du processus d'importation.",
          refresh: "Actualiser la page"
        }
      },
      qrCode: {
        title: "Code QR",
        instructions: "Scannez le code QR avec votre téléphone pour vous connecter",
        timeRemaining: "Temps restant",
        noQrFound: "Aucun code QR trouvé",
        expired: "Code QR expiré. Cliquez pour en générer un nouveau",
        connected: "Connecté avec succès!"
      },
      fileImport: {
        title: "Importation de fichiers",
        startButton: "Démarrer l'importation",
        companyRequired: "L'entreprise est obligatoire",
        processedFiles: "{{processed}} sur {{total}} fichiers traités",
        errors: "{{count}} erreurs trouvées",
        successMessage: "Importation réussie! {{total}} fichiers traités.",
        errorMessage: "Erreur lors de l'importation. Veuillez réessayer.",
        startError: "Erreur lors du démarrage de l'importation",
        complete: "Importação concluída com sucesso!",
        error: "Erro durante a importação"
      },
      oldsettings: {
        tabs: {
          ai: "Intelligence Artificielle",
          generalParams: "Paramètres généraux",
          advanced: "Paramètres avancés"
        },
        openai: {
          label: "Modèle OpenAI",
          helper: "Choisissez le modèle d'intelligence artificielle OpenAI à utiliser dans les réponses automatiques. Fondamental pour garantir la qualité et la précision des réponses automatiques, améliorant l'efficacité du service.",
          models: {
            gpt4o: "GPT-4o - Modèle principal pour les tâches complexes",
            gpt4oMini: "GPT-4o Mini - Modèle léger et rapide",
            gpt4Turbo: "GPT-4 Turbo - Dernière version avec des capacités de vision",
            o1Preview: "O1 Preview - Modèle axé sur le raisonnement",
            o1Mini: "O1 Mini - Modèle rapide pour le code et les mathématiques"
          }
        },
        downloadLimit: {
          label: "Limite de téléchargement (Mo)",
          helper: "Définit la limite maximale pour le téléchargement de fichiers en mégaoctets"
        },
        oneTicket: {
          label: "Activer l'utilisation d'un ticket par connexion",
          helper: "En activant cette fonction, chaque connexion différente du client générera un ticket distinct"
        },
        signup: {
          label: "Activer l'inscription à l'inscription",
          helper: "Permet aux nouveaux utilisateurs de s'inscrire sur la plateforme"
        },
        emailRegister: {
          label: "Envoyer un e-mail à l'enregistrement",
          helper: "Envoie un email de confirmation en utilisant l'entreprise principale"
        },
        messageRegister: {
          label: "Envoyer un message à l'enregistrement",
          helper: "Envoie un message de bienvenue lors de l'inscription"
        },
        closeTicketReason: {
          label: "Afficher la raison de la fermeture du ticket",
          helper: "Demande la raison de la clôture à la fin du service"
        },
        showSku: {
          label: "Afficher la valeur du ticket et le SKU",
          helper: "Affiche les informations de valeur et de SKU pendant le service"
        },
        quickMessages: {
          label: "Messages Rapides",
          company: "Par Entreprise",
          individual: "Par Utilisateur",
          helper: "Définit comment les messages rapides seront organisés"
        },
        greetingMessage: {
          label: "Envoyer une salutation en acceptant le ticket",
          helper: "Envoie un message automatique en acceptant le service"
        },
        userRating: {
          label: "Évaluation de l'utilisateur",
          helper: "Permet aux clients d'évaluer le service"
        },
        schedule: {
          label: "Gestion des Horaires",
          disabled: "Désactivé",
          company: "Par Entreprise",
          queue: "Par Secteur",
          helper: "Définit comment les horaires de service seront contrôlés"
        },
        ignoreGroup: {
          label: "Ignorer les messages de groupe",
          helper: "Ne traite pas les messages provenant de groupes"
        },
        acceptCalls: {
          label: "Accepter les appels",
          helper: "Permet de recevoir des appels vocaux et vidéo"
        },
        chatbot: {
          label: "Type de Chatbot",
          text: "Texte",
          helper: "Définit le format d'interaction du chatbot"
        },
        transferMessage: {
          label: "Message de transfert",
          helper: "Envoie un message lors du transfert du service"
        },
        queueGreeting: {
          label: "Salutation dans un seul secteur",
          helper: "Envoie une salutation lorsqu'il n'y a qu'un seul secteur"
        },

        omie: {
          label: "Intégration avec Omie",
          config: "Paramètres Omie",
          appKey: "Clé de l'application",
          appSecret: "Secret de l'application",
          helper: "Autoriser l'intégration avec le système Omie",
          configHelper: "Configurer les informations d'identification pour l'intégration avec Omie",
          saveButton: "Enregistrer les paramètres Omie",
          requiredFields: "Remplissez tous les champs obligatoires d'Omie"
        },
        ixc: {
          title: "IXC",
          ip: "IP du IXC",
          token: "Jeton du IXC"
        },
        mkauth: {
          title: "MK-AUTH",
          ip: "IP du MK-AUTH",
          clientId: "Identifiant du client",
          clientSecret: "Secret du Client"
        },
        asaas: {
          title: "ASAAS",
          token: "Jeton ASAAS"
        },
        smtp: {
          title: "SMTP",
          server: "Serveur SMTP",
          username: "Utilisateur SMTP",
          password: "Mot de passe SMTP",
          port: "Port SMTP"
        },
        support: {
          title: "Support",
          whatsapp: "Support WhatsApp",
          message: "Message par défaut"
        },
        apiToken: {
          label: "Jeton de l'API",
          copied: "Token copié dans le presse-papiers",
          generate: "Générer un nouveau jeton",
          delete: "Supprimer le jeton"
        },
        success: "Opération réussie",
        loading: "Mise à jour en cours...",
        error: "Une erreur s'est produite lors de l'opération",
        save: "Enregistrer",
        cancel: "Annuler"
      },
      satisfactionSurvey: {
        tooltip: "Vous avez {{count}} enquête(s) de satisfaction en attente",
        reminderTitle: "Votre avis est important !",
        reminderMessage: "Vous avez {{count}} enquête(s) de satisfaction en attente de réponse.",
        reminderSubtext: "Votre évaluation nous aide à améliorer continuellement l'AutoAtende.",
        remindLater: "Rappeler plus tard",
        openNow: "Répondre maintenant"
      },
      flowBuilder: {
        list: {
          title: "Constructeur de flux",
          searchPlaceholder: "Rechercher par nom",
          newFlow: "Nouveau flux",
          name: "Nom",
          whatsapp: "WhatsApp",
          status: "Statut",
          createdAt: "Créé le",
          actions: "Actions",
          active: "Actif",
          inactive: "Inactif",
          edit: "Éditer",
          test: "Tester",
          delete: "Supprimer",
          duplicate: "Dupliquer",
          duplicateSuccess: "Flux dupliqué avec succès",
          duplicateError: "Erreur lors de la duplication du flux",
          importFlow: "Importer le flux",
          createFirst: "Créez dès maintenant le premier flux",
          createSuccess: "Flux créé avec succès",
          confirmDelete: "Confirmer la suppression",
          confirmDeleteMessage: "Êtes-vous sûr de vouloir supprimer le flux {{name}}?",
          noFlows: "Aucun flux trouvé",
          noSearchResults: "Aucun flux trouvé avec les critères de recherche",
          fetchError: "Erreur lors de la recherche de flux",
          deleteError: "Erreur lors de la suppression du flux",
          deleteSuccess: "Flux supprimé avec succès",
          testError: "Erreur lors du test du flux",
          testSuccess: "Test du flux démarré avec succès",
          toggleError: "Erreur lors de la modification du statut du flux"
        },
        import: {
          title: "Importer le flux",
          instruction: "Sélectionnez ou faites glisser un fichier JSON de flux exporté précédemment.",
          dropFile: "Cliquez ou faites glisser un fichier ici",
          fileFormat: "Seuls les fichiers JSON sont acceptés",
          noFileSelected: "Veuillez sélectionner un fichier à importer",
          success: "Flux importé avec succès",
          error: "Erreur lors de l'importation du flux",
          action: "Importer"
        },
        create: "Créer",
        editing: "Édition du flux",
        createNew: "Créer un nouveau flux",
        save: "Enregistrer",
        test: "Tester",
        validate: "Valider",
        preview: {
          title: "Aperçu",
          simulation: "Simulation du flux",
          welcome: "Démarrage de la simulation du flux...",
          startNode: "Flux démarré",
          endNode: "Flux terminé",
          terminalNode: "Flux terminé",
          switchFlow: "Changement de flux vers",
          attendantNode: "Transfert à un agent humain en cours...",
          apiCall: "Appel API pour",
          apiSuccess: "Appel réussi !",
          evaluating: "Évaluation de la variable :",
          conditionMatch: "Condition correspondante",
          defaultPath: "Suivant le chemin par défaut",
          typeMessage: "Entrez un message...",
          disabled: "Simulation en cours...",
          restart: "Redémarrer la simulation",
          pauseAuto: "Mettre en pause la lecture automatique",
          playAuto: "Démarrer la lecture automatique",
          next: "Étape suivante",
          completed: "Simulation terminée",
          waitingInput: "En attente de l'entrée de l'utilisateur",
          inProgress: "En cours",
          openaiCall: "Démarrage de l'intégration avec OpenAI: {name}",
          openaiResponse: "Réponse OpenAI générée avec succès!",
          tagOperation: "Exécution du nœud TAG",
          queueTransfer: "Exécution du nœud de transfert de file d'attente",
          withVoice: "Réponse convertie en audio",
          typebotStart: "Démarrage du flux Typebot: {name}",
          typebotComplete: "Flux Typebot: {name} terminé avec succès",
          menuTitle: "Menu présenté à l'utilisateur",
          menuOption: "Option de menu sélectionnée",
          inputRequired: "Veuillez fournir une réponse de type: {type}",
          validationRequired: "La réponse sera validée comme: {type}",
          validationFailed: "La réponse n'a pas passé la validation. Simulation d'un flux d'erreur."
        },
        saveFlow: "Enregistrer le flux",
        close: "Fermer",
        export: "Exporter le flux",
        validationErrorOutput: "Sortie pour erreur",
        success: {
          saved: "Flux enregistré avec succès",
          testStarted: "Test démarré avec succès",
          exported: "Flux exporté avec succès"
        },
        validation: {
          nameRequired: "Le nom est obligatoire",
          whatsappRequired: "Vous devez sélectionner un WhatsApp",
          apiKeyRequired: "La clé API est obligatoire",
          promptRequired: "Le prompt est obligatoire",
          urlRequired: "L'URL est obligatoire",
          invalidUrl: "URL invalide",
          typebotIdRequired: "L'ID du Typebot est obligatoire",
          fixErrors: "Veuillez corriger les erreurs avant d'enregistrer"
        },
        outputs: {
          success: "Succès",
          error: "Erreur",
          below: "en dessous",
          right: "à droite",
          noSelection: "Aucune sélection"
        },
        errors: {
          loadFailed: "Échec du chargement du flux",
          saveFailed: "Échec de l'enregistrement du flux",
          testFailed: "Échec du démarrage du test",
          exportFailed: "Échec de l'exportation du flux"
        },
        form: {
          name: "Nom du flux",
          description: "Description",
          whatsapp: "WhatsApp",
          selectWhatsapp: "Sélectionnez un WhatsApp"
        },
        sidebar: {
          nodes: "Nœuds disponibles",
          dragHelp: "Faites glisser les nœuds dans le flux",
          connectHelp: "Connectez les nœuds pour créer votre flux",
          help: "Aide",
          messageNodes: "MESSAGES",
          flowNodes: "FLUX",
          integrationNodes: "INTEGRATIONS",
          helpTooltip: "Documentation des nœuds",
          tagDescription: "Ajoute ou supprime des tags des contacts"
        },
        help: {
          title: "Documentação dos Nós",
          introduction: "Les nœuds sont les éléments de base pour la construction de flux. Chaque type de nœud a des fonctionnalités spécifiques et peut être configuré pour différents comportements. Cette documentation fournit des informations détaillées sur chaque type de nœud disponible dans le système.",
          propertiesSection: "Propriétés",
          connectionsSection: "Connexions",
          usageSection: "Comment utiliser",
          exampleSection: "Exemple:",
          propertyName: "Propriété",
          propertyDescription: "Description",
          connectionType: "Type",
          connectionDescription: "Description",
          menuNode: {
            title: "Menu",
            description: "Ce nœud crée un menu interactif avec des options pour que l'utilisateur choisisse.",
            properties: {
              label: "Étiquette d'identification du nœud (optionnelle)",
              menuTitle: "Titre qui s'affichera dans le menu",
              menuOptions: "Liste des options du menu que l'utilisateur peut sélectionner",
              useEmoji: "Option pour utiliser des emojis dans les options du menu"
            },
            connections: {
              defaultOutput: "Sortie par défaut utilisée lorsque aucune option n'est sélectionnée",
              optionOutputs: "Une sortie pour chaque option du menu, permettant différents flux basés sur le choix de l'utilisateur"
            },
            usage: "Utilisez ce nœud pour présenter un ensemble d'options pour que l'utilisateur choisisse, créant des interactions ciblées et des ramifications dans le flux.",
            example: "Un menu pour que l'utilisateur choisisse le type d'assistance qu'il souhaite : \"Support Technique\", \"Ventes\", \"Réclamations\"."
          },
          properties: {
            label: "Étiquette",
            messageType: "Type de Message",
            message: "Message",
            mediaUrl: "URL du Média",
            caption: "Légende",
            question: "Question",
            variableName: "Nom de la Variable",
            inputType: "Type d'Entrée",
            options: "Options",
            variable: "Variable",
            conditions: "Conditions",
            targetFlow: "Flux de Destination",
            transferVariables: "Transférer les Variables",
            assignmentType: "Type d'attribution",
            assignedUser: "Agent Assigné",
            timeout: "Temps d'Attente",
            endFlow: "Fermer le Flux",
            method: "Méthode HTTP",
            url: "URL",
            headers: "En-têtes",
            secretKey: "Clé secrète",
            contentType: "Type de Contenu",
            body: "Corps",
            queryParams: "Paramètres de requête",
            responseVariable: "Variable de réponse",
            responseFilter: "Filtre de réponse",
            authentication: "Authentification",
            validationType: "Type de validation",
            useValidationErrorOutput: "Utiliser la sortie pour l'erreur"
          },
          connections: {
            input: "Entrée",
            output: "Sortie",
            singleInput: "Une entrée en haut du nœud",
            singleOutput: "Une sortie en bas du nœud"
          },
          messageNode: {
            title: "Nœud de message",
            description: "Le nœud de message permet d'envoyer un message texte simple au contact. C'est le type de nœud le plus basique et le plus utilisé.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              messageType: "Type de message (texte, image, audio, vidéo, fichier)",
              message: "Contenu du message à envoyer",
              mediaUrl: "URL du média à envoyer (pour les types non-texte)"
            },
            usage: "Utilisez ce nœud pour envoyer des informations, des instructions ou du contenu multimédia au contact. Il est idéal pour fournir des informations ou des instructions avant de poser des questions.",
            example: "Envoyer un message de bienvenue, expliquer le fonctionnement d'un service, ou envoyer une image promotionnelle."
          },
          imageNode: {
            title: "Nœud d'image",
            description: "Le nœud d'image permet d'envoyer une image au contact, avec la possibilité d'inclure une légende explicative.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              mediaUrl: "L'image à envoyer (téléchargement ou URL)",
              caption: "Texte optionnel accompagnant l'image"
            },
            usage: "Utilisez ce nœud lorsque vous devez envoyer des images telles que des photos de produits, des instructions visuelles, des infographies ou tout contenu visuel.",
            example: "Envoyer un catalogue de produits, une carte de localisation, ou une bannière promotionnelle."
          },
          queueNode: {
            title: "Secteur",
            description: "Ce nœud transfère l'assistance vers un secteur spécifique et termine le flux.",
            properties: {
              label: "Étiquette d'identification du nœud (optionnelle)",
              queue: "Secteur vers lequel l'assistance sera transférée"
            },
            connections: {
              output: "Aucune sortie - termine le flux et transfère vers le secteur"
            },
            usage: "Utilisez ce nœud lorsque vous devez transférer l'assistance vers un secteur spécifique et terminer le flux actuel. Le ticket restera en attente dans le secteur sélectionné.",
            example: "Un client demande une assistance spécialisée, et vous transférez le ticket au service \"Support Technique\", en terminant le flux du bot."
          },
          openaiNode: {
            title: "Nœud OpenAI",
            description: "Le nœud OpenAI permet d'intégrer l'intelligence artificielle à votre flux, générant des réponses basées sur des modèles de langage avancés.",
            properties: {
              label: "Étiquette d'identification du nœud dans le flux",
              name: "Nom de l'intégration pour référence",
              apiKey: "Clé API pour l'authentification sur le service OpenAI",
              prompt: "Instructions détaillées pour orienter le comportement du modèle",
              voice: "Option pour convertir le texte en discours avec des voix disponibles",
              temperature: "Contrôle de la randomisation des réponses (0-2)",
              maxTokens: "Limite la taille de la réponse générée",
              maxMessages: "Définit le nombre maximum d'interactions pour le contexte"
            },
            usage: "Utilisez pour créer des assistants virtuels, répondre à des questions avec IA ou générer du contenu dynamique basé sur les entrées de l'utilisateur.",
            example: "Un assistant virtuel qui répond aux questions sur les produits de l'entreprise, en utilisant un message personnalisé pour garantir des réponses précises et alignées avec la marque."
          },
          typebotNode: {
            title: "Nœud Typebot",
            description: "Le nœud Typebot permet d'intégrer des flux externes créés sur la plateforme Typebot, permettant des expériences conversationnelles complexes et personnalisées.",
            properties: {
              label: "Étiquette d'identification du nœud dans le flux",
              name: "Nom de l'intégration pour référence",
              typebotUrl: "URL de base du Typebot où le flux est hébergé",
              typebotId: "Identifiant unique du flux Typebot à intégrer",
              typebotToken: "Jeton d'authentification pour accéder aux flux protégés",
              saveResponse: "Option pour stocker les réponses de l'utilisateur dans le flux Typebot"
            },
            usage: "Utilisez pour intégrer des flux complexes pré-construits, des questionnaires, des formulaires ou des processus de collecte de données structurées.",
            example: "Un processus de qualification des leads qui utilise un Typebot pour collecter des informations spécifiques du client avant de les transmettre à un opérateur humain."
          },
          questionNode: {
            title: "Nœud de Question",
            description: "Le nœud de question permet de poser une question au contact et de capturer sa réponse, en proposant des options prédéfinies ou en acceptant des réponses libres.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              question: "La question à envoyer au contact",
              variableName: "Nom de la variable où la réponse sera stockée",
              inputType: "Type de réponse attendu (options, texte, numéro, email, téléphone)",
              options: "Liste d'options pour que le contact choisisse (lorsque le type est \"options\")",
              validationType: "Définit le type de validation à appliquer à la réponse",
              useValidationErrorOutput: "Crée une sortie supplémentaire pour gérer les erreurs de validation"
            },
            connections: {
              defaultOutput: "Sortie par défaut pour le type de texte libre ou lorsque aucune option ne correspond",
              optionOutputs: "Une sortie pour chaque option définie (lorsque le type est \"options\")",
              validationErrorOutput: "Sortie utilisée lorsque la réponse échoue à la validation"
            },
            usage: "Utilisez ce nœud pour interagir avec le contact, collecter des informations ou diriger le flux en fonction de ses choix.",
            example: "Demander dans quel service le contact souhaite parler, demander un e-mail pour l'inscription, ou demander une évaluation numérique de 1 à 5."
          },
          conditionalNode: {
            title: "Nœud de Condition",
            description: "Le nœud de condition permet de ramifier le flux en fonction de la valeur d'une variable, créant des chemins différents en fonction de la condition remplie.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              variable: "Nom de la variable à évaluer dans les conditions",
              conditions: "Liste de conditions avec des valeurs attendues et des destinations correspondantes"
            },
            connections: {
              defaultOutput: "Sortie par défaut lorsque aucune condition n'est remplie",
              conditionOutputs: "Une sortie pour chaque condition définie"
            },
            usage: "Utilisez ce nœud pour créer des branches dans le flux en fonction des informations collectées précédemment ou des variables du système.",
            example: "Vérifier si le client est déjà enregistré, diriger vers des services différents en fonction du choix précédent, ou personnaliser le flux en fonction des données du client."
          },
          endNode: {
            title: "Nœud de Fin",
            description: "Le nœud de fin marque la fin d'un chemin dans le flux. Lorsque le flux atteint ce nœud, l'exécution est terminée pour le contact.",
            properties: {
              label: "Nom d'identification du nœud dans le flux"
            },
            connections: {
              output: "N'a pas de sorties"
            },
            usage: "Utilisez ce nœud pour marquer la fin d'un chemin dans le flux, en mettant fin à l'interaction automatisée.",
            example: "Terminer l'assistance après avoir fourni les informations demandées, mettre fin au flux après la collecte de données, ou terminer une branche spécifique du flux."
          },
          switchFlowNode: {
            title: "Nœud de Changement de Flux",
            description: "Le nœud de changement de flux permet de transférer l'exécution vers un autre flux, permettant la modularisation des flux en parties plus petites et réutilisables.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              targetFlow: "Flux vers lequel l'exécution sera transférée",
              transferVariables: "Option pour transférer les variables du flux actuel vers le nouveau flux"
            },
            connections: {
              output: "N'a pas de sorties dans le flux actuel, car l'exécution est transférée vers un autre flux"
            },
            usage: "Utilisez ce nœud pour créer des flux modulaires qui peuvent être réutilisés dans différents contextes ou pour organiser des flux complexes en parties plus petites.",
            example: "Transférer vers un flux d'inscription, démarrer un flux de paiement, ou diriger vers un sous-menu spécifique."
          },
          attendantNode: {
            title: "Nœud d'Opérateur",
            description: "Le nœud d'opérateur transfère la conversation à un opérateur humain, permettant la poursuite de l'assistance par un opérateur réel.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              assignmentType: "Détermine si l'attribution sera manuelle (pour un opérateur spécifique) ou automatique (basée sur le secteur)",
              assignedUser: "Opérateur spécifique vers lequel l'assistance sera dirigée (lorsque le type est \"manuel\")",
              timeout: "Temps d'attente maximum pour l'attribution de l'assistance",
              endFlow: "Détermine si le flux sera terminé après le transfert à l'opérateur"
            },
            connections: {
              output: "Une sortie qui sera suivie si l'assistance n'est pas attribuée dans le délai imparti"
            },
            usage: "Utilisez ce nœud lorsque le contact a besoin de parler à un agent humain, que ce soit pour résoudre des problèmes complexes ou fournir un service personnalisé.",
            example: "Transférer à un agent après des tentatives infructueuses de résolution automatisée, diriger vers un spécialiste d'un sujet spécifique, ou offrir un service humain comme option."
          },
          webhookNode: {
            title: "Nœud de Webhook",
            description: "Le nœud de webhook permet d'effectuer des appels HTTP vers des systèmes externes, en envoyant et recevant des données pour une intégration avec d'autres plateformes.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              method: "Méthode de la requête (GET, POST, PUT, PATCH, DELETE)",
              url: "Adresse de l'endpoint vers lequel la requête sera envoyée",
              headers: "En-têtes HTTP à envoyer avec la requête",
              variableName: "Nom de la variable où la réponse sera stockée",
              secretKey: "Clé pour la signature HMAC de la requête (sécurité)"
            },
            usage: "Utilisez ce nœud pour intégrer le flux avec des systèmes externes, rechercher ou envoyer des données vers d'autres plateformes.",
            example: "Vérifier le statut d'une commande dans un e-commerce, envoyer des données d'inscription à un CRM, ou consulter des informations dans une API externe."
          },
          apiNode: {
            title: "Nœud de Demande d'API",
            description: "Le nœud de Demande d'API permet d'effectuer des appels API plus élaborés avec des configurations avancées, une gestion des erreurs et un traitement des réponses.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              method: "Méthode de la requête (GET, POST, PUT, PATCH, DELETE)",
              url: "Adresse de l'endpoint vers lequel la requête sera envoyée",
              headers: "En-têtes HTTP à envoyer avec la requête",
              contentType: "Type de contenu du corps de la requête",
              body: "Données à envoyer dans le corps de la requête (pour les méthodes autres que GET)",
              queryParams: "Paramètres à ajouter à l'URL sous forme de chaîne de requête",
              responseVariable: "Nom de la variable où la réponse sera stockée",
              responseFilter: "Chemin JSONPath pour extraire seulement une partie de la réponse",
              authentication: "Paramètres d'authentification (Basic Auth, Bearer Token, API Key)"
            },
            connections: {
              successOutput: "Sortie suivie lorsque la requête réussit",
              errorOutput: "Sortie suivie lorsque la requête échoue"
            },
            usage: "Utilisez ce nœud pour des intégrations avancées avec des APIs nécessitant des configurations spécifiques, une gestion des erreurs ou un traitement des données.",
            example: "Intégrer avec des APIs de paiement, des systèmes CRM complexes, ou des services nécessitant une authentification spécifique et un traitement de réponses élaboré."
          },
          tagNode: {
            title: "Nœud de Tag",
            description: "Le nœud de tag permet d'ajouter ou de supprimer des tags des contacts. Les tags sont utiles pour la segmentation et l'automatisation des campagnes.",
            properties: {
              label: "Nom d'identification du nœud dans le flux",
              operation: "Définit si les tags seront ajoutées ou supprimées du contact",
              selectionMode: "Détermine si une seule ou plusieurs tags seront manipulées",
              tags: "Liste des tags qui seront ajoutées ou supprimées du contact"
            },
            connections: {
              output: "Une sortie qui sera suivie après l'ajout/suppression des tags"
            },
            usage: "Utilisez ce nœud pour ajouter ou supprimer des tags des contacts pendant le flux de conversation, permettant une segmentation future.",
            example: "Ajouter un tag 'Intéressé' lorsque le contact montre de l'intérêt pour un produit, ou supprimer le tag 'Non contacté' après la première interaction."
          }
        },
        openai: {
          name: "Nom de l'intégration",
          apiKey: "Clé API OpenAI",
          prompt: "Invite",
          promptHelp: "Insérez les instructions pour le modèle OpenAI",
          voice: "Voix",
          voiceKey: "Clé de l'API vocale",
          voiceRegion: "Région de l'API vocale",
          temperature: "Température",
          maxTokens: "Nombre maximal de jetons",
          maxMessages: "Nombre maximal de messages",
          helpText: "Ce nœud permet d'intégrer OpenAI à votre flux pour créer des réponses dynamiques basées sur l'intelligence artificielle. Définissez le prompt approprié pour guider le comportement du modèle."
        },
        typebot: {
          name: "Nom de l'intégration",
          typebotUrl: "URL du Typebot",
          typebotUrlHelp: "URL complet de votre Typebot (ex: https://bot.exemple.com)",
          typebotId: "ID du Typebot",
          typebotToken: "Jeton du Typebot",
          typebotTokenHelp: "Optionnel. Utilisé pour l'authentification",
          saveResponse: "Enregistrer la réponse du Typebot",
          helpText: "Ce nœud permet d'intégrer un flux du Typebot dans votre service client. Configurez l'URL et l'ID corrects pour rediriger l'utilisateur vers le flux approprié."
        },
        queue: {
          transferTo: "Transférer vers le secteur",
          selectQueue: "Sélectionner le secteur",
          queueRequired: "Le secteur est obligatoire",
          endFlow: "Met fin au flux",
          terminalDescription: "Lorsque le service client est transféré vers un secteur, le flux est terminé. Le ticket restera en attente dans le secteur sélectionné.",
          helpText: "Remarque : Le nœud de secteur transfère la conversation vers un secteur spécifique. Le flux sera terminé et le ticket restera en attente dans le secteur sélectionné."
        },
        nodes: {
          start: "Début",
          end: "Fin",
          message: "Message",
          conditional: "Condition",
          attendant: "Agent",
          switchFlow: "Changer de flux",
          user: "Utilisateur",
          location: "Emplacement",
          outputs: "Ce nœud a {{count}} sorties",
          openai: "OpenAI",
          typebot: "Typebot",
          queue: "Secteur",
          webhook: "Webhook",
          image: "Image",
          question: "Question",
          withVoice: "Avec la voix",
          automatedFlow: "Flux automatisé",
          api: "Requête API",
          tag: {
            title: "Étiquette",
            configuration: "Configuration des étiquettes",
            selectTags: "Sélectionner des étiquettes",
            searchTags: "Rechercher des étiquettes",
            createTag: "Créer une étiquette",
            noTags: "Aucune étiquette trouvée",
            noTagsSelected: "Aucune étiquette sélectionnée",
            noResults: "Aucun résultat trouvé",
            operation: "Opération",
            addOperation: "Ajouter une étiquette",
            removeOperation: "Supprimer une étiquette",
            selectionMode: "Mode de sélection",
            singleMode: "Unique étiquette",
            multipleMode: "Multiples étiquettes",
            selectOne: "Sélectionnez une étiquette",
            selectMultiple: "Sélectionner un ou plusieurs tags",
            preview: "Visualisation",
            willAdd: "Sera ajouté au contact :",
            willRemove: "Sera supprimé du contact :",
            helpText: "Ce nœud permet d'ajouter ou de supprimer des étiquettes des contacts. Les étiquettes sont utiles pour la segmentation et l'automatisation des campagnes."
          }
        },
        properties: {
          title: "Propriétés du nœud",
          label: "Étiquette",
          message: "Message",
          messagePlaceholder: "Entrez le message à envoyer...",
          messageType: "Type de message",
          variable: "Variable",
          variablePlaceholder: "Nom de la variable à évaluer",
          conditions: "Conditions",
          conditionValue: "Valeur de la condition",
          targetNode: "Nœud de destination",
          addCondition: "Ajouter une condition",
          unknownNodeType: "Type de nœud inconnu",
          buttons: "Boutons",
          buttonText: "Texte du bouton",
          buttonValue: "Valeur du bouton",
          addButton: "Ajouter un bouton",
          mode: "Mode",
          flow: "Flux",
          timeout: "Temps d'Attente",
          caption: "Légende",
          address: "Adresse",
          url: "URL",
          method: "Méthode",
          headers: "En-têtes",
          body: "Corps de la requête",
          responseVariable: "Variable de réponse",
          authType: "Type d'authentification",
          maxMessages: "Nombre maximal de messages",
          name: "Nom",
          apiKey: "Clé API",
          prompt: "Invite",
          voice: "Voix",
          temperature: "Température",
          maxTokens: "Nombre maximal de jetons",
          typebotUrl: "URL du Typebot",
          typebotId: "ID du Typebot",
          typebotToken: "Jeton du Typebot",
          saveResponse: "Enregistrer la réponse",
          types: {
            text: "Texte",
            image: "Image",
            audio: "Audio",
            video: "Vidéo",
            file: "Fichier",
            button: "Boutons",
            list: "Liste"
          },
          mediaUrl: "URL du média",
          mediaUrlPlaceholder: "Entrez l'URL du média",
          listItems: "Éléments de la liste",
          listTitle: "Titre de la liste",
          listButtonText: "Texte du bouton de la liste",
          triggers: "Déclencheurs",
          triggersPlaceholder: "Mots qui déclenchent le flux (séparés par des virgules)",
          exclusive: "Exclusif (empêche d'autres flux)"
        },
        controls: {
          zoomIn: "Zoom avant",
          zoomOut: "Zoom arrière",
          fitView: "Ajuster à l'écran",
          undo: "Annuler",
          redo: "Refaire"
        },
        tooltips: {
          deleteNode: "Supprimer le nœud",
          duplicateNode: "Dupliquer le nœud",
          connectNodes: "Connectez pour définir le prochain nœud"
        },
        messages: {
          deleteNode: "Êtes-vous sûr de vouloir supprimer ce nœud?",
          connectionRemoved: "Connexion supprimée",
          connectionAdded: "Connexion ajoutée",
          nodeAdded: "Nœud ajouté",
          nodeRemoved: "Nœud supprimé",
          invalidConnection: "Connexion invalide",
          maxConnectionsReached: "Nombre maximum de connexions atteint",
          noContent: "Pas de contenu",
          noImage: "Pas d'image",
          uploaded: "chargé",
          unsupportedType: "Type de message non pris en charge",
          noConditions: "Aucune condition définie"
        },
        messageTypes: {
          text: "Texte",
          image: "Image",
          audio: "Audio",
          video: "Vidéo",
          document: "Document",
          location: "Emplacement",
          unknown: "Type inconnu"
        },
        actions: {
          duplicate: "Dupliquer",
          deleteEdge: "Supprimer la connexion",
          edit: "Éditer",
          delete: "Supprimer",
          transferVariables: "Transférer des variables"
        },
        execution: {
          testMode: "Mode test",
          startedAt: "Démarré le",
          status: {
            active: "En cours d'exécution",
            completed: "Terminé",
            error: "Erreur",
            waitingInput: "En attente de réponse"
          }
        },
        inputTypes: {
          text: "Texte",
          number: "Numéro",
          email: "E-mail",
          phone: "Téléphone",
          cpf: "CPF",
          cnpj: "CNPJ",
          media: "Média",
          options: "Options",
          undefined: "Indéfini"
        },
        validationTypes: {
          none: "Sans validation",
          email: "Validation d'e-mail",
          cpf: "Validation de CPF",
          cnpj: "Validation de CNPJ",
          regex: "Expression Régulière"
        },
        modes: {
          automatic: "Automatique",
          manual: "Manuel"
        },
        units: {
          seconds: "secondes"
        }
      },
      showTicketOpenModal: {
        title: {
          header: "Assistance en cours"
        },
        form: {
          message: "Ce contact est déjà en cours de traitement",
          user: "Agent",
          queue: "Secteur",
          messageWait: "Veuillez patienter, vous serez transféré"
        },
        buttons: {
          close: "Fermer"
        }
      },
      adminDashboard: {
        title: "Tableau de bord administratif",
        loadingMessage: "Chargement des données du tableau de bord...",
        fetchError: "Erreur lors du chargement des données. Veuillez réessayer.",
        updatingMessage: "Mise à jour des données...",
        lastUpdate: "Dernière mise à jour : {{time}}",
        refreshTooltip: "Mettre à jour les données",
        timeRanges: {
          last7days: "7 derniers jours",
          last30days: "30 derniers jours",
          last90days: "90 derniers jours"
        },
        tabs: {
          overview: "Vue d'ensemble",
          financial: "Financier",
          system: "Système"
        },
        metrics: {
          activeCompanies: "Entreprises actives",
          total: "total",
          activeUsers: "Utilisateurs actifs",
          lastMonth: "dernier mois",
          monthlyRevenue: "Revenu mensuel",
          avgResponseTime: "Temps de réponse moyen",
          pending: "en attente"
        },
        contactMap: {
          title: "Distribution géographique",
          loading: "Chargement de la carte...",
          totalContacts: "Total de contacts",
          noContacts: "Aucun contact",
          concentration: "Concentration",
          info: "Visualisation de la distribution des contacts par état"
        },
        qualityMetrics: {
          title: "Métriques de qualité",
          info: "Indicateurs de qualité du service",
          fcr: {
            title: "Résolution au premier contact",
            subtitle: "Total résolu : {{total}}",
            trend: "Tendance FCR"
          },
          directResolution: {
            title: "Résolution directe",
            subtitle: "Total direct : {{total}}",
            trend: "Tendance de la résolution directe"
          },
          chartHelp: "Le graphique montre l'évolution des métriques de qualité au fil du temps"
        },
        messaging: {
          title: "Métriques de messages",
          lastUpdate: "Dernière mise à jour",
          info: "Informations sur les métriques des messages",
          totalMessages: "Total des messages",
          sent: "Envoyées",
          received: "Reçues",
          averageResponseTime: "Temps de réponse moyen",
          engagementRate: "Taux d'engagement",
          growth: "Croissance",
          activeUsers: "Utilisateurs actifs",
          avgMessagesPerUser: "Moyenne de messages par utilisateur",
          peakHour: "Heure de pointe",
          messages: "messages",
          responseTime: "Temps de réponse",
          failureRate: "Taux d'échec",
          disconnections: "Déconnexions aujourd'hui"
        },
        whatsapp: {
          title: "Statut WhatsApp",
          info: "Surveillance des connexions WhatsApp",
          activeConnections: "Connexions actives",
          status: {
            connected: "Connecté",
            disconnected: "Déconnecté",
            connecting: "Connexion en cours"
          },
          deliveryRate: "Taux de livraison",
          messages: "Messages",
          responseTime: "Tempo Resposta",
          failureRate: "Taux d'échec",
          disconnections: "Déconnexions"
        },
        performance: {
          title: "Performance du système",
          info: "Métriques de performance et ressources",
          cpuUsage: "Utilisation du CPU",
          memoryUsage: "Utilisation de la mémoire",
          networkUsage: "Utilisation du réseau",
          cpuCores: "Cœurs CPU",
          totalMemory: "Mémoire totale",
          statusChecks: "Vérifications",
          services: {
            database: "Base de données",
            cache: "Cache",
            network: "Réseau"
          },
          alerts: "Alertes",
          healthy: "Système en bonne santé",
          issues: "Problèmes détectés",
          avgResponseTime: "Temps de réponse moyen",
          requestsPerSecond: "Requêtes/s",
          errorRate: "Taux d'erreur",
          systemInfo: "Informations du système"
        },
        financialMetrics: {
          title: "Métriques financières",
          info: "Indicateurs financiers et revenus",
          monthlyRevenue: "Revenu mensuel",
          revenue: "Revenu",
          planDistribution: "Répartition par plan",
          defaultRate: "Taux de défaut de paiement",
          projection: "Projection de revenus",
          projectedRevenue: "Revenu projeté",
          actualRevenue: "Revenu réel"
        },
        engagementMetrics: {
          title: "Métriques d'engagement",
          info: "Métriques d'interaction et d'engagement",
          messagesPerDay: "Messages par jour",
          campaignSuccess: "Succès des campagnes",
          activeContacts: "Contacts actifs",
          deliveryRate: "Taux de livraison"
        },
        campaignMetrics: {
          title: "Métriques de campagne",
          successRate: "Taux de réussite",
          active: "Actives",
          completed: "Terminé",
          pending: "En attente",
          failed: "Échecs",
          sent: "Envoyées",
          delivered: "Livré",
          info: "Analyse des campagnes de messages",
          status: {
            active: "Campagnes actives",
            completed: "Campagnes terminées",
            pending: "Campagnes en attente",
            failed: "Campagnes en échec"
          },
          totalContacts: "Total de contacts",
          deliveryRate: "Taux de livraison",
          engagementRate: "Taux d'engagement",
          performance: "Graphique de performance",
          byType: "Distribution par type"
        }
      },
      queueHelpModal: {
        title: "Aide - Options de secteur",
        helpButtonTooltip: "Ouvrir l'aide sur les options de secteur",
        tabs: {
          overview: "Vue d'ensemble",
          optionTypes: "Types d'options",
          advanced: "Ressources avancées",
          examples: "Exemples"
        },
        overview: {
          subtitle: "Qu'est-ce que les options de secteur?",
          description: "Les options de secteur permettent de créer des flux d'interaction automatisés. Vous pouvez configurer des menus d'assistance, collecter des informations des clients, appliquer des validations, transférer des conversations, et bien plus encore.",
          commonUseCases: "Cas d'utilisation courants",
          useCase1: "Menu d'assistance",
          useCase1Desc: "Crie menus interativos para direcionar os clientes para o setor correto",
          useCase2: "Transfert automatique",
          useCase2Desc: "Transférez des conversations vers des files d'attente, des utilisateurs ou d'autres numéros selon les besoins",
          useCase3: "Collecte de données",
          useCase3Desc: "Collectez et validez les informations des clients avant l'assistance humaine",
          structureTitle: "Structure des options",
          structureDesc: "Les options de secteur sont organisées dans une structure hiérarchique:",
          structure1: "Étapes",
          structure1Desc: "Chaque niveau représente une étape du flux d'assistance",
          structure2: "Messages",
          structure2Desc: "Chaque étape peut contenir un message et des options de réponse",
          structure3: "Test et visualisation",
          structure3Desc: "Vous pouvez tester le flux en utilisant le bouton de lecture"
        },
        optionTypes: {
          subtitle: "Types d'options disponibles",
          description: "Il existe plusieurs types d'options qui peuvent être utilisés à différentes fins:",
          textDescription: "Envoyer un message texte simple au client.",
          textUseWhen: "Utilisez pour des messages informatifs, des demandes ou des instructions.",
          audioDescription: "Envoyer un fichier audio au client.",
          audioUseWhen: "Utilisez pour des messages vocaux, des instructions audio ou des salutations personnalisées.",
          videoDescription: "Envoyer une vidéo au client.",
          videoUseWhen: "Utilisez pour des tutoriels, des démonstrations de produits ou des présentations.",
          imageDescription: "Envoyer une image au client.",
          imageUseWhen: "Use para mostrar produtos, catálogos, instruções visuais ou qualquer conteúdo gráfico.",
          documentDescription: "Envoyer un document au client (PDF, DOCX, etc).",
          documentUseWhen: "Utilisez pour envoyer des manuels, des contrats, des formulaires ou tout document formel.",
          contactDescription: "Envoyer une carte de contact au client.",
          contactUseWhen: "Utilisez pour partager des contacts importants, tels que le support technique, les ventes ou d'autres départements.",
          transferTitle: "Options de transfert",
          transferDescription: "Permet de transférer la conversation vers différentes destinations:",
          transferQueueDesc: "Transfère la conversation vers un autre service client",
          transferUserDesc: "Transfère la conversation à un agent spécifique",
          transferWhatsappDesc: "Transfère la conversation vers un autre numéro WhatsApp de votre compte",
          transferUseWhen: "Utilisez lorsque vous devez diriger le client vers le service ou l'agent le plus approprié.",
          validationDescription: "Valide les informations fournies par le client selon des règles prédéfinies.",
          validationUseWhen: "Utilisez pour collecter et valider des données telles que le CPF, l'e-mail, le téléphone ou des informations personnalisées.",
          validationCPFDesc: "Valide si le format du CPF est correct et s'il s'agit d'un CPF valide",
          validationEmailDesc: "Valide si le format de l'e-mail est correct",
          validationPhoneTitle: "Téléphone",
          validationPhoneDesc: "Valide si le format du numéro de téléphone est correct",
          validationCustomTitle: "Personnalisé",
          validationCustomDesc: "Permet de créer des validations personnalisées en utilisant des expressions régulières (regex)",
          conditionalDescription: "Analyse la réponse du client et dirige vers différentes options en fonction des conditions.",
          conditionalUseWhen: "Utilisez pour créer des flux dynamiques qui s'adaptent aux réponses des clients.",
          conditionalOperators: "Opérateurs disponibles",
          operatorEqualsDesc: "Vérifie si la réponse est exactement égale à la valeur spécifiée",
          operatorContainsDesc: "Vérifie si la réponse contient la valeur spécifiée",
          operatorStartsWithDesc: "Vérifie si la réponse commence par la valeur spécifiée",
          operatorEndsWithDesc: "Vérifie si la réponse se termine par la valeur spécifiée",
          operatorRegexDesc: "Vérifie si la réponse correspond au motif regex spécifié"
        },
        advanced: {
          subtitle: "Ressources avancées",
          description: "Explorez des fonctionnalités avancées pour créer des flux de service plus sophistiqués:",
          nestingTitle: "Structure imbriquée",
          nestingDesc: "Il est possible de créer des structures imbriquées pour organiser le flux de service en niveaux hiérarchiques.",
          nestingExample: "Exemple de structure imbriquée",
          variablesTitle: "Variables dans le message",
          variablesDesc: "Utilisez des variables pour personnaliser les messages avec des informations de contact, de service ou d'entreprise.",
          variablesExample: "Exemple d'utilisation de variables",
          variablesSample: "Bonjour {{contact.name}}, bienvenue à {{queue.name}}!",
          flowControlTitle: "Contrôle de flux",
          flowControlDesc: "Combinez des options conditionnelles et des validations pour créer des flux de service dynamiques.",
          conditionalExample: "Exemple de flux conditionnel",
          conditionalStep1: "Configurez une question initiale (ex: 'Comment puis-je vous aider?')",
          conditionalStep2: "Ajoutez une option de type 'conditionnelle'",
          conditionalStep3: "Configurez des conditions basées sur des mots-clés (ex: 'support', 'achat')",
          conditionalStep4: "Définir des destinations différentes pour chaque condition",
          previewTitle: "Visualisation et Test",
          previewDesc: "Utilisez la fonction de visualisation pour tester comment les messages apparaîtront pour le client.",
          previewSteps: "Comment utiliser la fonction de visualisation"
        },
        examples: {
          subtitle: "Exemples Pratiques",
          description: "Consultez des exemples de configurations courantes pour inspirer vos flux de service :",
          menuTitle: "Menu d'assistance",
          menuDescription: "Un menu de service de base qui dirige le client vers différents secteurs.",
          menuExample: "Exemple de menu",
          menuText: "Bienvenue à notre service ! 👋\n\nSélectionnez une option en tapant le numéro correspondant :\n\n1️⃣ Support Technique\n2️⃣ Financier\n3️⃣ Ventes\n\nOu tapez 'agent' pour parler à l'un de nos collaborateurs.",
          menuStep1: "Configurer le message de bienvenue avec les options",
          menuStep2: "Configurer un message spécifique pour le support technique",
          menuStep3: "Configurer le transfert vers le service financier",
          menuStep4: "Configurer le transfert vers un agent commercial",
          formTitle: "Collecte de données",
          formDescription: "Un formulaire pour collecter et valider les informations du client avant le service.",
          formExample: "Exemple de collecte de données",
          formText: "Pour continuer avec votre service, nous avons besoin de quelques informations :\nVeuillez indiquer votre nom complet :",
          formStep1: "Configurer le message initial demandant des données",
          formStep2: "Configurer la validation pour le nom (non vide)",
          formStep3: "Configurer la validation de l'e-mail",
          formStep4: "Configurer la validation du CPF",
          formStep5: "Configurer le message de conclusion et de transfert",
          conditionalTitle: "Service Conditionnel",
          conditionalDescription: "Un flux qui dirige le client en fonction des mots-clés dans la réponse.",
          conditionalExample: "Exemple de flux conditionnel",
          conditionalText: "Comment puis-je vous aider aujourd'hui ? Veuillez décrire brièvement votre besoin.",
          conditionalStep1: "Configurer la question initiale",
          conditionalStep2: "Configurer l'analyse conditionnelle de la réponse",
          conditionalCondition1: "S'il contient 'problème' ou 'ne fonctionne pas'",
          conditionalTarget1: "Diriger vers l'option de Support Technique",
          conditionalCondition2: "S'il contient 'acheter' ou 'prix'",
          conditionalTarget2: "Diriger vers l'option de Ventes",
          conditionalDefault: "Option par défaut pour les autres réponses",
          conditionalTarget3: "Diriger vers le Service Général",
          implementation: "Implémentation"
        },
        common: {
          useWhen: "Quand utiliser",
          availableTypes: "Types disponibles"
        }
      },
      groups: {
        title: "Groupes",
        createNewGroup: "Créer un Nouveau Groupe",
        joinGroup: "Rejoindre un Groupe",
        groupInfo: "Informations du Groupe",
        groupDeleted: "Groupe supprimé avec succès",
        createSuccess: "Groupe créé avec succès",
        updateSuccess: "Groupe mis à jour avec succès",
        deleteConfirmTitle: "Confirmer la suppression",
        deleteConfirmMessage: "Êtes-vous sûr de vouloir supprimer le groupe {name} ?",
        groupName: "Nom du Groupe",
        groupNamePlaceholder: "Entrez le nom du groupe",
        description: "Description",
        settings: "Paramètres",
        onlyAdminsMessage: "Seuls les administrateurs peuvent envoyer des messages",
        onlyAdminsSettings: "Seuls les administrateurs peuvent modifier les paramètres",
        forceDelete: "Supprimer de force",
        forceDeleteConfirmTitle: "Confirmer la suppression forcée",
        forceDeleteConfirmMessage: "Êtes-vous sûr de vouloir supprimer de force le groupe \"{name}\"?",
        forceDeleteWarning: "ATTENTION : Cette action supprimera uniquement le groupe du système, en ignorant les erreurs de communication avec WhatsApp. Utilisez uniquement lorsque le groupe a déjà été supprimé sur WhatsApp et apparaît toujours dans le système.",
        groupForceDeleted: "Groupe supprimé de force avec succès.",
        extractContacts: "Extraire les contacts du groupe",
        extractContactsDescription: "Insérez le lien d'invitation d'un groupe WhatsApp pour extraire la liste des contacts.",
        groupInviteLink: "Lien d'invitation du groupe",
        downloadExcel: "Télécharger la liste de contacts",
        copyDownloadLink: "Copier le lien de téléchargement",
        extractContactsInfo: "Cette fonction permet d'extraire des contacts de groupes publics. Le système entrera dans le groupe, extraira les contacts et générera un fichier Excel que vous pouvez télécharger.",
        importContacts: "Importer des contacts dans un groupe",
        importContactsDescription: "Sélectionnez un groupe et envoyez un fichier CSV ou Excel contenant les numéros de téléphone que vous souhaitez ajouter.",
        selectGroup: "Sélectionner un groupe",
        selectGroupHelp: "Choisissez le groupe dans lequel vous souhaitez importer des contacts.",
        selectFile: "Sélectionner un fichier",
        fileFormatInfo: "Le fichier doit contenir une colonne appelée 'numero' avec les numéros de téléphone au format international, sans caractères spéciaux (ex : 5511999999999).",
        downloadTemplate: "Télécharger le modèle de fichier",
        template: "Modèle",
        importSuccess: "Importation terminée : {valid} contact(s) valide(s) importé(s), {invalid} numéro(s) invalide(s).",
        invalidNumbers: "Numéros invalides",
        importTips: "Conseils d'importation",
        importTip1: "Utilisez des numéros au format international (Ex : 5511999999999).",
        importTip2: "Vérifiez si les numéros sont valides et actifs sur WhatsApp.",
        importTip3: "Évitez d'inclure trop de numéros à la fois pour éviter le blocage par spam.",
        tabs: {
          info: "Informations",
          participants: "Participants",
          inviteLink: "Lien d'invitation",
          list: "Liste",
          invites: "Invitations",
          requests: "Demandes",
          extract: "Extrair Contatos",
          import: "Importer des contacts"
        },
        addParticipants: "Ajouter des participants",
        addNewParticipants: "Ajouter de nouveaux participants",
        searchContacts: "Rechercher des contacts...",
        selectedParticipants: "Participants sélectionnés",
        noParticipantsSelected: "Aucun participant sélectionné",
        searchParticipants: "Rechercher des participants...",
        selectContacts: "Sélectionner des contacts",
        participantsAdded: "Participants ajoutés avec succès",
        noParticipantsFound: "Aucun participant trouvé",
        tryAnotherSearch: "Essayez une autre recherche ou effacez le champ de recherche",
        admin: "Administrateur",
        promoteToAdmin: "Promouvoir en tant qu'administrateur",
        demoteFromAdmin: "Supprimer les privilèges d'administrateur",
        removeParticipant: "Supprimer le participant",
        participantPromoted: "Participant promu administrateur",
        participantDemoted: "Privilèges d'administrateur supprimés",
        participantRemoved: "Participant retiré du groupe",
        inviteLink: "Lien d'invitation",
        inviteLinkDescription: "Partagez ce lien pour inviter des personnes au groupe. Toute personne avec le lien peut rejoindre le groupe.",
        generateInviteLink: "Générer un lien d'invitation",
        copyLink: "Copier le lien",
        revokeAndGenerate: "Révoquer et Générer un Nouveau",
        inviteCodeRevoked: "Lien d'invitation révoqué et nouveau lien généré",
        linkCopied: "Lien copié dans le presse-papiers",
        pendingRequests: "Demandes en attente",
        noRequests: "Aucune demande en attente",
        requestsDescription: "Lorsque de nouvelles demandes seront reçues, elles apparaîtront ici.",
        requestedAt: "Demandé à",
        approve: "Approuver",
        reject: "Rejeter",
        participantApproved: "Participant approuvé",
        participantRejected: "Participant rejeté",
        requestsInfo: "Seules les demandes d'adhésion aux groupes avec approbation apparaissent ici.",
        selectGroupToSeeRequests: "Sélectionnez un groupe dans la liste pour voir les demandes en attente",
        searchPlaceholder: "Rechercher des groupes...",
        newGroup: "Nouveau groupe",
        noGroupsFound: "Aucun groupe trouvé",
        createGroupsMessage: "Créez un nouveau groupe ou rejoignez un groupe existant",
        table: {
          name: "Nom",
          participants: "Participants",
          createdAt: "Créé le",
          actions: "Actions",
          rowsPerPage: "Lignes par page",
          of: "de"
        },
        actions: {
          edit: "Informations",
          requests: "Demandes",
          delete: "Supprimer",
          forceDelete: "Exclusion forcée"
        },
        joinByInvite: "Rejoindre avec un code d'invitation",
        joinByInviteDescription: "Pour rejoindre un groupe, vous avez besoin du code d'invitation. Collez le code ou le lien d'invitation ci-dessous.",
        joinGroupDescription: "Pour rejoindre un groupe, vous avez besoin du code d'invitation. Collez le code ou le lien d'invitation ci-dessous.",
        inviteCode: "Code ou Lien d'invitation",
        check: "Vérifier",
        joining: "En cours d'entrée...",
        join: "Se connecter",
        groupInfoFound: "Informations du groupe trouvées ! Vérifiez les détails ci-dessous avant d'entrer.",
        createdBy: "Créé par",
        participants: "Participants",
        unknown: "Inconnu",
        joinSuccess: "Vous avez rejoint le groupe avec succès",
        profilePicSuccess: "Photo de profil mise à jour avec succès",
        profilePicRemoved: "Photo de profil supprimée avec succès",
        clickToChangePhoto: "Cliquez pour changer la photo",
        clickToAddPhoto: "Cliquez pour ajouter une photo",
        removeProfilePicConfirm: "Supprimer la photo de profil",
        removeProfilePicMessage: "Êtes-vous sûr de vouloir supprimer la photo de profil de ce groupe?",
        addGroupPhoto: "Ajouter une photo de groupe",
        groupPhotoSelected: "Photo sélectionnée (cliquez pour modifier)",
        profilePicUploadError: "Erreur lors du téléchargement de l'image",
        errors: {
          titleRequired: "Le nom du groupe est obligatoire",
          participantsRequired: "Ajoutez au moins un participant",
          inviteCodeRequired: "Le code d'invitation est obligatoire",
          invalidInviteCode: "Code d'invitation invalide",
          inviteCodeFailed: "Échec de l'obtention du code d'invitation",
          selectParticipants: "Sélectionnez au moins un participant à ajouter",
          linkRequired: "Le lien d'invitation est obligatoire",
          extractFailed: "Échec de l'extraction des contacts. Veuillez réessayer plus tard.",
          selectGroup: "Sélectionnez un groupe",
          selectFile: "Sélectionnez un fichier",
          invalidFileFormat: "Format de fichier invalide. Utilisez CSV, XLSX ou XLS.",
          importFailed: "Échec de l'importation des contacts. Vérifiez le format du fichier et réessayez."
        }
      },
      employers: {
        title: "Gestion des entreprises",
        searchPlaceholder: "Rechercher des entreprises...",
        noEmployers: "Aucune entreprise trouvée",
        buttons: {
          add: "Ajouter une entreprise",
          edit: "Éditer",
          delete: "Supprimer",
          cancel: "Annuler",
          update: "Mettre à jour",
          create: "Créer",
          refresh: "Mettre à jour la liste",
          filter: "Filtrer"
        },
        table: {
          name: "Nom",
          positions: "Postes",
          createdAt: "Date de création",
          status: "Statut",
          actions: "Actions",
          rowsPerPage: "Lignes par page",
          positionsLabel: "postes"
        },
        status: {
          active: "Actif",
          inactive: "Inactif"
        },
        modal: {
          add: "Ajouter une nouvelle entreprise",
          edit: "Modifier l'entreprise"
        },
        form: {
          name: "Nom de l'entreprise",
          nameRequired: "Le nom est obligatoire"
        },
        confirmModal: {
          deleteTitle: "Confirmer la suppression",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer cette entreprise?"
        },
        notifications: {
          created: "Entreprise créée avec succès",
          updated: "Entreprise mise à jour avec succès",
          deleted: "Entreprise supprimée avec succès",
          fetchError: "Erreur lors du chargement des entreprises",
          saveError: "Erreur lors de l'enregistrement de l'entreprise",
          deleteError: "Erreur lors de la suppression de l'entreprise",
          nameRequired: "Le nom de l'entreprise est obligatoire"
        },
        stats: {
          total: "Total des entreprises",
          active: "Entreprises actives",
          recentlyAdded: "Ajouté récemment"
        }
      },
      positions: {
        title: "Gestion des postes",
        searchPlaceholder: "Rechercher des postes...",
        noDataFound: "Oops, nous n'avons rien ici.",
        buttons: {
          add: "Ajouter un poste",
          edit: "Éditer",
          delete: "Supprimer",
          cancel: "Annuler",
          update: "Mettre à jour",
          create: "Créer",
          refresh: "Mettre à jour la liste",
          filter: "Filtrer"
        },
        table: {
          name: "Nom",
          employers: "Entreprises",
          createdAt: "Date de création",
          status: "Statut",
          actions: "Actions",
          rowsPerPage: "Lignes par page"
        },
        status: {
          active: "Actif",
          inactive: "Inactif"
        },
        modal: {
          add: "Ajouter un nouveau poste",
          edit: "Modifier le poste",
          employersLabel: "Entreprises",
          employersPlaceholder: "Sélectionnez les entreprises"
        },
        form: {
          name: "Nom du poste",
          nameRequired: "Le nom est obligatoire"
        },
        confirmModal: {
          deleteTitle: "Confirmer la suppression",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer ce poste ?"
        },
        notifications: {
          created: "Poste créé avec succès",
          updated: "Poste mis à jour avec succès",
          deleted: "Poste supprimé avec succès",
          fetchError: "Erreur lors du chargement des postes",
          saveError: "Erreur lors de l'enregistrement du poste",
          deleteError: "Erreur lors de la suppression du poste",
          nameRequired: "Le nom du poste est obligatoire"
        },
        stats: {
          total: "Total des postes",
          active: "Postes actifs",
          recentlyAdded: "Ajoutés récemment"
        }
      },
      buttons: {
        save: "Enregistrer",
        cancel: "Annuler",
        close: "Fermer",
        delete: "Supprimer",
        edit: "Éditer",
        add: "Ajouter",
        update: "Mettre à jour",
        download: "Télécharger le fichier",
        confirm: "Confirmer",
        export: "Exporter",
        print: "Imprimer",
        saving: "Enregistrement...",
        filter: "Filtrer",
        clear: "Effacer",
        clearFilters: "Effacer les filtres",
        applyFilters: "Appliquer les filtres",
        finish: "Terminer",
        next: "Suivant",
        back: "Retour",
        processing: "En cours de traitement..."
      },
      dateTime: {
        today: "Aujourd'hui",
        clear: "Effacer",
        ok: "OK",
        invalidDate: "Format de date invalide",
        maxDate: "La date ne peut pas être postérieure à la date maximale",
        minDate: "La date ne peut pas être antérieure à la date minimale"
      },
      taskReports: {
        title: "Rapports de tâches",
        subtitle: "Vue d'ensemble des performances et statistiques des tâches",
        all: "Tous",
        summary: {
          total: "Total de tâches",
          completed: "Tâches terminées",
          pending: "Tâches en attente",
          overdue: "Tâches en retard",
          inProgress: "En cours"
        },
        filters: {
          title: "Filtres",
          startDate: "Date de début",
          endDate: "Date de fin",
          user: "Utilisateur",
          status: "Statut",
          group: "Groupe",
          all: "Tous",
          clearFilters: "Effacer les filtres"
        },
        status: {
          title: "Statut",
          completed: "Terminée",
          pending: "En attente",
          overdue: "En retard",
          inProgress: "En cours",
          assigned: "Attribuées"
        },
        weeklyProgress: {
          title: "Progression hebdomadaire",
          subtitle: "Tâches terminées par jour",
          noData: "Aucune donnée disponible pour la période sélectionnée"
        },
        userPerformance: {
          title: "Performance par utilisateur",
          subtitle: "Comparaison des tâches par utilisateur",
          assigned: "Atribuídas",
          completed: "Terminé",
          overdue: "En retard",
          noData: "Aucun utilisateur trouvé"
        },
        statusDistribution: {
          title: "Répartition par statut",
          subtitle: "Vue d'ensemble des tâches par statut",
          noData: "Aucune tâche trouvée"
        },
        attachments: {
          title: "Pièces jointes et notes",
          subtitle: "Statistiques des pièces jointes et des notes",
          withAttachments: "Avec pièces jointes",
          withNotes: "Avec des notes",
          fileTypes: "Types de fichiers",
          noData: "Aucune pièce jointe trouvée"
        },
        export: {
          title: "Exporter le rapport",
          pdf: "Exporter en PDF",
          excel: "Exporter en tant qu'Excel",
          success: "Rapport exporté avec succès",
          error: "Erreur lors de l'exportation du rapport"
        },
        errors: {
          loadError: "Erreur lors du chargement des données",
          retryButton: "Réessayer",
          invalidDateRange: "Période invalide",
          generic: "Une erreur s'est produite. Veuillez réessayer plus tard."
        },
        tooltips: {
          refresh: "Mettre à jour les données",
          export: "Exporter le rapport",
          filter: "Appliquer des filtres",
          clearFilters: "Effacer les filtres"
        },
        noData: {
          title: "Aucune donnée à afficher",
          message: "Essayez d'ajuster les filtres ou de créer quelques tâches"
        }
      },
      asaas: {
        title: "Intégration Asaas",
        subtitle: "Configurez votre intégration avec Asaas pour l'envoi automatique de factures",
        configuration: "Configuration",
        credentials: "Identifiants",
        rules: "Règles d'envoi",
        preview: "Aperçu",
        success: {
          saveSettings: "Paramètres enregistrés avec succès"
        },
        stats: {
          title: "Statistiques Asaas",
          totalCompanies: "Total des entreprises",
          pendingCompanies: "Entreprises avec des factures en attente",
          overdueCompanies: "Entreprises avec des factures en retard",
          lastUpdate: "Dernière mise à jour"
        },
        steps: {
          credentials: "Identifiants",
          connection: "Connexion",
          rules: "Règles",
          review: "Révision"
        },
        stepHelper: {
          credentials: "Configurez vos identifiants Asaas",
          connection: "Sélectionnez la connexion WhatsApp",
          rules: "Configurez les règles d'envoi",
          review: "Revoyez vos paramètres"
        },
        token: "Token Asaas",
        tokenRequired: "Le token est obligatoire",
        tokenHelper: "Token d'accès trouvé dans le tableau de bord Asaas",
        validatingToken: "Validation du token...",
        tokenConfigured: "Token configuré",
        whatsapp: "Connexion WhatsApp",
        whatsappRequired: "La connexion WhatsApp est obligatoire",
        whatsappHelper: "Sélectionnez quelle connexion sera utilisée pour l'envoi",
        whatsappSelected: "WhatsApp sélectionné",
        rule: "Règle",
        rulesCount: "Total de règles",
        addRule: "Ajouter une règle",
        editRule: "Modifier la règle",
        deleteRule: "Supprimer la règle",
        ruleTitle: "Règle d'envoi",
        daysBeforeDue: "Jours avant l'échéance",
        days: "jours",
        message: "Message",
        messageHelper: "Utilisez les variables disponibles pour personnaliser votre message",
        availableVariables: "Variables disponibles",
        variables: {
          name: "Nom du client",
          value: "Montant de la facturation",
          dueDate: "Date d'échéance",
          paymentLink: "Lien de paiement"
        },
        defaultMessage: "Bonjour {name}, vous avez une facture d'un montant de {value} qui expire le {dueDate}.",
        sendBoleto: "Envoyer le Boleto/PIX",
        sendBoletoHelp: "Envoie le code QR du PIX et le code à copier-coller",
        qrCodeMessage: "Voici le code QR pour le paiement via PIX :",
        pixCodeMessage: "Code PIX à copier-coller :",
        paymentOptions: "Options de paiement",
        executionTime: "Heure d'exécution",
        messageInterval: "Intervalle entre les messages",
        messageIntervalHelper: "Intervalle en minutes entre l'envoi de chaque message",
        weekdays: {
          monday: "Lundi",
          tuesday: "Mardi",
          wednesday: "Mercredi",
          thursday: "Jeudi",
          friday: "Vendredi",
          saturday: "Samedi",
          sunday: "Dimanche"
        },
        viewMode: "Mode d'affichage",
        listView: "Liste",
        gridView: "Grille",
        previewTitle: "Aperçu du message",
        messagePreview: "Aperçu du message",
        previewBoletoMessage: "Le Boleto/QR Code sera automatiquement joint",
        optional: "Optionnel",
        save: "Enregistrer",
        saving: "Enregistrement...",
        cancel: "Annuler",
        next: "Suivant",
        back: "Retour",
        finish: "Terminer",
        runNow: "Exécuter maintenant",
        processStarted: "Traitement démarré",
        processing: "En cours de traitement...",
        readyToSave: "Configuration prête à être enregistrée",
        configurationSummary: "Résumé de la configuration",
        configured: "Configuré",
        notConfigured: "Non configuré",
        savedSuccess: "Paramètres enregistrés avec succès",
        deleteSuccess: "Règle supprimée avec succès",
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette règle?",
        errors: {
          fetchStats: "Erreur lors de la recherche des statistiques de Asaas",
          invalidDays: "Nombre de jours invalide",
          messageRequired: "Le message est obligatoire",
          invalidToken: "Jeton invalide",
          errorSaving: "Erreur lors de l'enregistrement des paramètres",
          errorLoading: "Erreur lors du chargement des paramètres",
          errorConnection: "Erreur lors du test de connexion",
          loadSettings: "Erreur lors du chargement des paramètres",
          saveSettings: "Erreur lors de l'enregistrement des paramètres",
          runProcess: "Erreur lors de l'exécution du traitement",
          preview: "Erreur lors du chargement de l'aperçu"
        },
        noRules: "Aucune règle configurée",
        tooltips: {
          addRule: "Ajouter une nouvelle règle d'envoi",
          deleteRule: "Supprimer cette règle",
          editRule: "Modifier cette règle",
          preview: "Voir l'aperçu du message",
          sendBoleto: "Activer l'envoi de facture/PIX",
          runNow: "Exécuter le traitement maintenant",
          settings: "Paramètres d'intégration",
          showVariables: "Afficher les variables disponibles"
        },
        status: {
          success: "Succès",
          error: "Erreur",
          warning: "Attention",
          info: "Information"
        },
        delete: "Supprimer",
        edit: "Éditer",
        add: "Ajouter",
        settings: {
          success: "Paramètres enregistrés avec succès",
          error: "Erreur lors de l'enregistrement des paramètres",
          save: "Enregistrer les paramètres"
        }
      },
      whatsappTemplates: {
        title: "Modèles WhatsApp",
        fetchError: "Erreur lors de la recherche de modèles",
        deleteSuccess: "Modèle supprimé avec succès",
        deleteError: "Erreur lors de la suppression du modèle",
        createSuccess: "Modèle créé avec succès",
        updateSuccess: "Modèle mis à jour avec succès",
        submitError: "Erreur lors de l'enregistrement du modèle",
        deleteTitle: "Supprimer le modèle",
        deleteMessage: "Êtes-vous sûr de vouloir supprimer ce modèle?",
        table: {
          name: "Nom",
          status: "Statut",
          language: "Langue",
          category: "Catégorie",
          actions: "Actions"
        },
        buttons: {
          add: "Nouveau modèle",
          edit: "Éditer",
          delete: "Supprimer",
          view: "Voir",
          cancel: "Annuler"
        },
        modal: {
          addTitle: "Nouveau modèle",
          editTitle: "Modifier le modèle",
          viewTitle: "Voir le modèle"
        },
        form: {
          name: "Nom du modèle",
          language: "Langue",
          category: "Catégorie",
          header: "En-tête",
          body: "Corps du message",
          bodyHelp: "Utilisez {{1}}, {{2}}, etc pour des variables dynamiques",
          footer: "Pied de page",
          buttons: "Boutons",
          addButton: "Ajouter un bouton",
          buttonType: "Type de bouton",
          buttonText: "Texte du bouton"
        },
        preview: {
          title: "Aperçu du modèle"
        }
      },
      campaigns: {
        title: "Campagnes",
        searchPlaceholder: "Rechercher des campagnes...",
        empty: {
          title: "Aucune campagne trouvée",
          message: "Vous n'avez pas encore de campagnes enregistrées. Créez une nouvelle campagne pour commencer vos envois en masse.",
          button: "Créer une campagne"
        },
        buttons: {
          add: "Nouvelle campagne",
          edit: "Éditer",
          delete: "Supprimer",
          report: "Rapport",
          stop: "Arrêter",
          restart: "Redémarrer",
          upload: "Télécharger"
        },
        tabs: {
          campaigns: "Campagnes",
          contactLists: "Listes de contacts",
          reports: "Rapports",
          settings: "Paramètres",
          files: "Fichiers"
        },
        table: {
          name: "Nom",
          status: "Statut",
          contactList: "Liste de contacts",
          whatsapp: "WhatsApp",
          scheduledAt: "Planification",
          confirmation: "Confirmation",
          actions: "Actions",
          enabled: "Activé",
          disabled: "Désactivé",
          noList: "Sans liste",
          noWhatsapp: "Non défini",
          noSchedule: "Non planifié",
          rowsPerPage: "Éléments par page",
          of: "de"
        },
        status: {
          inactive: "Inactive",
          scheduled: "Planifiée",
          inProgress: "En cours",
          cancelled: "Annulée",
          finished: "Terminée",
          unknown: "Inconnu"
        },
        dialog: {
          new: "Nouvelle campagne",
          update: "Modifier la campagne",
          readonly: "Voir la campagne",
          form: {
            name: "Nom de la campagne",
            confirmation: "Confirmation de lecture",
            contactList: "Liste de contacts",
            tagList: "Étiquette",
            whatsapp: "Connexion WhatsApp",
            scheduledAt: "Planification",
            fileList: "Liste des fichiers",
            none: "Aucun",
            disabled: "Désactivé",
            enabled: "Activé",
            message1: "Message 1",
            message2: "Message 2",
            message3: "Message 3",
            message4: "Message 4",
            message5: "Message 5",
            confirmationMessage1: "Message de confirmation 1",
            confirmationMessage2: "Message de confirmation 2",
            confirmationMessage3: "Message de confirmation 3",
            confirmationMessage4: "Message de confirmation 4",
            confirmationMessage5: "Message de confirmation 5",
            messagePlaceholder: "Tapez votre message...",
            confirmationPlaceholder: "Entrez le message de confirmation...",
            messageHelp: "Utilisez {nome} pour insérer le nom du contact, {numero} pour le numéro",
            confirmationHelp: "Message envoyé lorsque le contact confirme la réception"
          },
          tabs: {
            message1: "Message 1",
            message2: "Message 2",
            message3: "Message 3",
            message4: "Message 4",
            message5: "Message 5"
          },
          buttons: {
            add: "Ajouter",
            edit: "Enregistrer les modifications",
            cancel: "Annuler",
            close: "Fermer",
            restart: "Redémarrer",
            attach: "Joindre un fichier"
          }
        },
        confirmationModal: {
          deleteTitle: "Supprimer la campagne",
          deleteMessage: "Cette action est irréversible et toutes les données liées à cette campagne seront perdues.",
          deleteMediaTitle: "Supprimer la pièce jointe",
          cancelConfirmTitle: "Annuler la campagne",
          cancelConfirmMessage: "Êtes-vous sûr de vouloir annuler cette campagne? Cette action est irréversible.",
          restartConfirmTitle: "Redémarrer la campagne",
          restartConfirmMessage: "Êtes-vous sûr de vouloir redémarrer cette campagne? Cela enverra à nouveau des messages à tous les contacts."
        },
        toasts: {
          success: "Campagne enregistrée avec succès!",
          deleted: "Campagne supprimée avec succès!",
          cancel: "Campagne annulée avec succès!",
          restart: "Campagne redémarrée avec succès!",
          fetchError: "Erreur lors de la recherche de campagnes.",
          saveError: "Erreur lors de l'enregistrement de la campagne.",
          deleteError: "Erreur lors de la suppression de la campagne.",
          cancelError: "Erreur lors de l'annulation de la campagne.",
          restartError: "Erreur lors du redémarrage de la campagne.",
          campaignFetchError: "Erreur lors du chargement des données de la campagne.",
          contactListsFetchError: "Erreur lors du chargement des listes de contacts.",
          whatsappsFetchError: "Erreur lors du chargement des connexions WhatsApp.",
          filesFetchError: "Erreur lors du chargement des listes de fichiers.",
          mediaDeleted: "Pièce jointe supprimée avec succès!",
          mediaDeleteError: "Erreur lors de la suppression de la pièce jointe.",
          mediaError: "Erreur lors du téléchargement de la pièce jointe, mais la campagne a été enregistrée."
        },
        validation: {
          nameRequired: "Le nom est obligatoire",
          nameMin: "Le nom doit comporter au moins 2 caractères",
          nameMax: "Le nom doit comporter au maximum 50 caractères",
          whatsappRequired: "La connexion WhatsApp est obligatoire",
          contactsRequired: "Sélectionnez une liste de contacts ou une étiquette",
          messageRequired: "Remplissez au moins un message"
        },
        warning: {
          title: "Attention!",
          contactLimit: {
            title: "Limite de contacts:",
            description: "Nous vous recommandons de ne pas dépasser 200 contacts par campagne pour éviter les blocages sur WhatsApp."
          },
          interval: {
            title: "Intervalle entre les messages:",
            description: "Configurez des intervalles adéquats entre les messages pour éviter les blocages sur WhatsApp."
          },
          observation: {
            title: "Remarque:",
            description: "Utilisez les campagnes de manière responsable. Les envois abusifs peuvent entraîner le blocage de votre compte WhatsApp."
          }
        },
        reports: {
          title: "Rapports de campagnes",
          selectCampaign: "Sélectionnez une campagne",
          selectToView: "Sélectionnez une campagne pour visualiser les rapports",
          filters: {
            today: "Aujourd'hui",
            week: "La semaine dernière",
            month: "Le mois dernier",
            quarter: "Les 3 derniers mois"
          },
          stats: {
            total: "Total des messages",
            delivered: "Livré",
            read: "Lues",
            replied: "Répondues"
          },
          charts: {
            title: "Analyse de performance",
            statusDistribution: "Répartition par statut",
            dailyProgress: "Progression quotidienne",
            messages: "Messages",
            delivered: "Livré",
            read: "Lues",
            replied: "Répondues"
          },
          details: {
            title: "Détails de la campagne",
            startedAt: "Démarrée le",
            completedAt: "Terminée le",
            status: "Statut",
            confirmation: "Confirmation",
            notStarted: "Non commencée",
            notCompleted: "Non terminée"
          },
          noData: {
            title: "Aucune donnée à afficher",
            message: "Aucune information n'est disponible pour cette campagne pour le moment."
          },
          noChartData: "Pas de données disponibles pour ce graphique",
          empty: {
            title: "Aucun rapport disponible",
            message: "Vous devez avoir des campagnes enregistrées pour visualiser les rapports.",
            button: "Créer une campagne"
          },
          chartType: "Type de graphique",
          chartTypes: {
            line: "Ligne",
            bar: "Barre",
            pie: "Camembert"
          },
          errors: {
            title: "Erreur lors du chargement du rapport",
            fetchCampaigns: "Erreur lors de la recherche de campagnes.",
            fetchReportData: "Erreur lors du chargement des données du rapport."
          },
          status: {
            pending: "En attente",
            delivered: "Livré",
            read: "Lue",
            replied: "Répondu",
            error: "Erreur",
            rejected: "Rejetée",
            canceled: "Annulée"
          }
        }
      },
      contactListsValidation: {
        nameRequired: "Le nom est obligatoire",
        nameMin: "Le nom doit comporter au moins 2 caractères",
        nameMax: "Le nom doit comporter au maximum 50 caractères"
      },
      contactListItems: {
        validation: {
          nameRequired: "Le nom est obligatoire",
          nameMin: "Le nom doit comporter au moins 2 caractères",
          nameMax: "Le nom doit comporter au maximum 50 caractères",
          numberRequired: "Le numéro est obligatoire",
          numberMin: "Le numéro doit comporter au moins 8 caractères",
          numberMax: "Le numéro doit comporter au maximum 50 caractères",
          emailInvalid: "E-mail invalide"
        },
        modal: {
          addTitle: "Ajouter un contact",
          editTitle: "Modifier le contact",
          mainInfo: "Informations principales",
          name: "Nom",
          number: "Numéro",
          email: "E-mail",
          numberHelp: "Format : DDI + DDD + Numéro (Ex : 5513912344321)",
          cancel: "Annuler",
          add: "Ajouter",
          saveChanges: "Enregistrer les modifications"
        },
        confirmationModal: {
          deleteTitle: "Supprimer le contact",
          deleteMessage: "Cette action est irréversible. Le contact sera définitivement supprimé de la liste."
        },
        importDialog: {
          title: "Importer des contacts",
          message: "Voulez-vous importer des contacts d'autres listes vers cette liste?",
          confirm: "Importer",
          cancel: "Annuler"
        },
        table: {
          name: "Nom",
          number: "Numéro",
          email: "E-mail",
          status: "Statut",
          actions: "Actions",
          rowsPerPage: "Éléments par page",
          of: "de"
        },
        buttons: {
          add: "Ajouter un contact",
          import: "Importer / Exporter",
          importFile: "Importer un fichier",
          importContacts: "Importer des contacts",
          export: "Exporter les contacts",
          downloadTemplate: "Télécharger le modèle",
          edit: "Éditer",
          delete: "Supprimer",
          deleteSelected: "Supprimer la sélection"
        },
        searchPlaceholder: "Rechercher par nom, numéro ou e-mail...",
        selected: "contacts sélectionnés",
        valid: "Valide",
        invalid: "Invalide",
        empty: {
          noContacts: "Aucun contact trouvé"
        },
        toasts: {
          added: "Contact ajouté avec succès!",
          updated: "Contact mis à jour avec succès!",
          deleted: "Contact supprimé avec succès!",
          deletedAll: "Contacts supprimés avec succès!",
          partialDeleteSuccess: "{success} contacts supprimés avec succès. {failed} n'ont pas pu être supprimés.",
          fetchError: "Erreur lors de la recherche de contacts.",
          saveError: "Erreur lors de l'enregistrement du contact.",
          deleteError: "Erreur lors de la suppression du contact.",
          importing: "Importation des contacts. Cela peut prendre quelques minutes."
        }
      },
      contactListManager: {
        tooltips: {
          contacts: "Voir les contacts",
          import: "Importer",
          downloadTemplate: "Télécharger le modèle"
        },
        buttons: {
          contacts: "Contacts",
          import: "Importer",
          downloadTemplate: "Télécharger le modèle"
        },
        menu: {
          uploadFile: "Envoyer le fichier",
          importContacts: "Importer des contacts",
          exportContacts: "Exporter les contacts"
        },
        importDialog: {
          title: "Importer des contacts",
          message: "Voulez-vous importer des contacts de votre WhatsApp dans cette liste?",
          cancel: "Annuler",
          confirm: "Importer"
        },
        errors: {
          noListSelected: "Aucune liste de contacts sélectionnée.",
          importError: "Erreur lors de l'importation des contacts.",
          fileUploadError: "Erreur lors de l'envoi du fichier."
        },
        toasts: {
          importing: "Importation des contacts WhatsApp...",
          exportSuccess: "Contacts exportés avec succès!",
          exportError: "Erreur lors de l'exportation des contacts.",
          fileUploadSuccess: "Fichier importé avec succès!"
        }
      },
      campaignsConfig: {
        title: "Paramètres de Campagnes",
        intervalSettings: {
          title: "Paramètres d'Intervalle",
          messageInterval: "Intervalle entre les Messages",
          longerIntervalAfter: "Intervalle Plus Long Après",
          greaterInterval: "Intervalle Plus Long",
          noInterval: "Pas d'Intervalle",
          second: "seconde",
          seconds: "secondes",
          notDefined: "Non défini",
          sends: "envois"
        },
        variables: {
          title: "Variables Personnalisées",
          add: "Ajouter une Variable",
          shortcut: "Raccourci",
          content: "Contenu",
          shortcutPlaceholder: "Ex: salutation",
          contentPlaceholder: "Ex: Bonjour, comment ça va?",
          addButton: "Ajouter",
          cancel: "Annuler",
          empty: "Aucune variable personnalisée définie."
        },
        saveButton: "Enregistrer les paramètres",
        warning: {
          title: "Attention à l'Utilisation des Campagnes",
          content1: "L'envoi en masse de messages est une fonctionnalité puissante, mais sensible.",
          content2: "WhatsApp peut appliquer des restrictions ou des blocages à votre numéro, en fonction de la configuration du temps et du volume des messages.",
          content3: "Pour éviter les blocages, nous vous recommandons de configurer des périodes d'envoi plus espacées et modérées.",
          regards: "Cordialement,",
          team: "Équipe"
        },
        confirmationModal: {
          deleteTitle: "Supprimer la Variable",
          deleteMessage: "Êtes-vous sûr de vouloir supprimer cette variable?"
        },
        toasts: {
          success: "Paramètres enregistrés avec succès!",
          emptyVariable: "Remplissez tous les champs de la variable.",
          duplicatedVariable: "Il existe déjà une variable avec ce raccourci.",
          fetchError: "Erreur lors du chargement des paramètres.",
          saveError: "Erreur lors de l'enregistrement des paramètres."
        }
      },
      delete: {
        warning: "Cette action ne peut pas être annulée !",
        cancel: "Annuler",
        confirm: "Supprimer",
        campaign: {
          title: "Supprimer la Campagne",
          message: "Êtes-vous sûr de vouloir supprimer cette campagne?"
        },
        contactList: {
          title: "Supprimer la Liste de Contacts",
          message: "Êtes-vous sûr de vouloir supprimer cette liste de contacts?"
        },
        item: {
          title: "Supprimer l'Élément",
          message: "Êtes-vous sûr de vouloir supprimer cet élément ?"
        }
      },
      empty: {
        title: "Aucune donnée trouvée",
        message: "Aucune donnée à afficher.",
        button: "Ajouter"
      },
      optionsPage: {
        general: "Général",
        integrations: "Intégrations",
        advanced: "Avancé",
        ai: "Intelligence Artificielle",
        general_params: "Paramètres généraux",
        downloadSettings: "Taille maximale des fichiers (envoyés et reçus)",
        saveAll: "Tout sauvegarder",
        successMessage: "Opération mise à jour avec succès.",
        allSettingsSaved: "Toutes les configurations ont été enregistrées avec succès.",
        onlyOneCloseOptionActive: "Une seule option de clôture peut être active à la fois",
        openaiModel: "Modèle OpenAI",
        openaiModelHelp: "Choisissez le modèle d'intelligence artificielle OpenAI à utiliser dans les réponses automatiques. Fondamental pour garantir la qualité et la précision des réponses automatiques, améliorant l'efficacité du service.",
        satisfactionSurveyTitle: "Enquête de satisfaction",
        enableSatisfactionSurvey: "Activer l'enquête et le rapport de satisfaction",
        enableSatisfactionSurveyHelp: "Active ou désactive les fonctionnalités d'enquête de satisfaction et de rapports dans le menu supérieur",
        satisfactionSurveyEnabled: "Enquête de satisfaction activée avec succès",
        satisfactionSurveyDisabled: "Enquête de satisfaction désactivée avec succès",
        enableOneTicketPerConnection: "Activer l'utilisation d'un ticket par connexion",
        enableOneTicketPerConnectionHelp: "En activant la fonctionnalité d'un ticket par connexion, si un client contacte l'équipe via différentes connexions, un ticket distinct sera généré pour chacune d'entre elles. L'opérateur répondra par défaut à la connexion où il a reçu le message.",
        enableOfficialWhatsapp: "Activer l'API officielle de WhatsApp",
        enableOfficialWhatsappHelp: "Active ou désactive l'utilisation de l'API officielle de WhatsApp Business pour la communication. Important pour les entreprises ayant besoin d'une connexion officielle et vérifiée avec WhatsApp.",
        initialPage: "Page d'accueil",
        initialPageHelp: "Définit quelle sera la page d'accueil du système lorsqu'il est accédé. Choisissez entre la page de présentation (home) ou la page de connexion directe.",
        homePage: "Page de présentation (Accueil)",
        loginPage: "Page de connexion",
        enableQueueWhenCloseTicket: "Définir le secteur à la clôture de l'assistance",
        enableQueueWhenCloseTicketHelp: "Demande la sélection d'un secteur (Secteur) à la clôture d'une assistance",
        enableTagsWhenCloseTicket: "Définir le(s) tag(s) à la clôture de l'assistance",
        enableTagsWhenCloseTicketHelp: "Demande la sélection de tags à la clôture d'une assistance",
        enableRegisterInSignup: "Activer l'enregistrement sur l'écran d'accueil",
        enableRegisterInSignupHelp: "Active ou désactive l'option d'inscription sur l'écran d'accueil, permettant aux nouveaux utilisateurs de s'inscrire sur la plateforme s'ils n'ont pas de compte. Contrôle la visibilité de l'option d'inscription, crucial pour gérer l'accès des nouveaux utilisateurs à la plateforme, en gardant le contrôle sur qui peut s'inscrire.",
        sendEmailInRegister: "Envoyer un e-mail lors de l'inscription",
        sendEmailInRegisterHelp: "Envoyer un e-mail en utilisant l'entreprise 1",
        downloadLimit: "Limite de téléchargement",
        downloadLimitHelp: "Définit la limite maximale de téléchargement de fichiers en mégaoctets. Crucial pour éviter la surcharge du système ou une mauvaise utilisation de l'infrastructure en limitant la taille des fichiers transférés.",
        sendMessageWhenRegiter: "Envoyer un message lors de l'inscription",
        sendMessageWhenRegiterHelp: "Ao cadastrar-se, o sistema irá enviar uma mensagem de boas vindas. Essa configuração garante que, ao se registrar, uma mensagem de boas vindas será enviada, proporcionando uma comunicação clara e eficiente.",
        enableSaveCommonContacts: "Activer l'enregistrement des contacts communs",
        enableSaveCommonContactsHelp: "Permet d'enregistrer des contacts qui ne sont pas enregistrés sur WhatsApp. Idéal pour conserver un enregistrement complet de tous les contacts, qu'ils aient ou non un compte WhatsApp.",
        saveContactsEnabled: "Enregistrement des contacts communs activé.",
        saveContactsDisabled: "Enregistrement des contacts communs désactivé.",
        enableReasonWhenCloseTicket: "Afficher une fenêtre modale de motif lors de la résolution du ticket",
        enableReasonWhenCloseTicketHelp: "À la fin de l'assistance, le système affichera une fenêtre modale pour que l'agent puisse indiquer le motif de la clôture. Cette configuration garantit l'enregistrement des motifs de clôture des assistances, offrant un meilleur contrôle et une analyse des motifs de clôture, ce qui peut aider à améliorer continuellement le service client.",
        showSKU: "Afficher la valeur du ticket et le SKU",
        showSKUHelp: "Configure si la valeur du ticket et le SKU seront affichés lors de l'assistance. Important pour fournir des informations financières détaillées, optimisant la prise de décision pendant l'assistance.",
        speedMessage: "Messages Rapides",
        speedMessageHelp: "Définit l'utilisation de messages rapides pour faciliter l'assistance. Augmente la productivité des agents en permettant des réponses rapides et standardisées, économisant du temps lors d'assistances répétitives.",
        byCompany: "Par Entreprise",
        byUser: "Par Utilisateur",
        sendanun: "Envoyer une salutation en acceptant le ticket",
        sendanunHelp: "Définit si un message de bienvenue sera envoyé automatiquement lors de l'acceptation d'un nouveau ticket. Améliore l'expérience client en recevant un accueil instantané, garantissant une interaction plus chaleureuse et professionnelle.",
        sendQueuePosition: "Envoyer un message avec la position dans la file d'attente",
        sendQueuePositionHelp: "Définit si le système enverra des messages informant la position du client dans la file d'attente. Important pour tenir le client informé de son temps d'attente estimé.",
        settingsUserRandom: "Choisir un agent aléatoire",
        settingsUserRandomHelp: "Active ou désactive la sélection aléatoire d'agents pour de nouveaux tickets. Utile pour répartir la charge de travail de manière plus équilibrée entre l'équipe.",
        calif: "Activer l'évaluation automatique",
        califHelp: "Configure l'activation ou la désactivation des évaluations automatiques de l'assistance. Crucial pour obtenir un retour continu des clients, permettant une amélioration constante de la qualité du service.",
        expedient: "Gestion des Horaires",
        expedientHelp: "Active ou désactive la gestion des horaires pour le contrôle des horaires. Important pour optimiser l'organisation et garantir que les services soient effectués dans les délais impartis.",
        buttons: {
          off: "Désactivé",
          partner: "Par Entreprise",
          quee: "Par Secteur"
        },
        ignore: "Ignorer les groupes WhatsApp",
        ignoreHelp: "Définit si les groupes WhatsApp seront ignorés lors de l'assistance. Essentiel pour se concentrer sur les interactions individuelles, évitant les distractions et la surcharge liées aux groupes de discussion.",
        typechatbot: "Type de Chatbot",
        typechatbotHelp: "Définit le type de chatbot qui sera utilisé, tel que du texte ou un autre format. Essentiel pour personnaliser l'interaction automatique avec les clients, offrant une expérience plus adaptée aux besoins de l'entreprise.",
        text: "Texte",
        list: "Liste",
        button: "Boutons",
        ticketSettings: "Options d'Assistance",
        contactSettings: "Options de Contacts",
        displayContactInfoDisabled: "Cette fonctionnalité ne peut être activée que si l'affichage des données commerciales du contact est désactivé",
        displayProfileImages: "Afficher la photo de profil du contact et de l'utilisateur à l'écran de l'assistance",
        displayProfileImagesHelp: "Permet d'afficher ou de masquer la photo de profil du contact et également de l'utilisateur dans les messages.",
        sendagent: "Envoyer un message lors du transfert",
        donwloadSettings: "Paramètres des Fichiers Envoyés/Reçus",
        developmentPanels: "Panneaux du Développeur",
        sendagentHelp: "Active ou désactive l'envoi de messages automatiques lors du transfert d'une assistance entre files d'attente ou agents. Important pour tenir le client informé du changement d'agents, améliorant la transparence et l'expérience de l'utilisateur.",
        greeatingOneQueue: "Envoyer un message de bienvenue pour un seul secteur",
        greeatingOneQueueHelp: "Définit si un message de bienvenue sera envoyé automatiquement lorsque l'assistance est transférée à un seul secteur. Garantit que le contact reçoive un accueil automatique lorsqu'il est transféré à un secteur, maintenant l'assistance plus personnelle et organisée, même dans des files d'attente avec un seul agent.",
        callSuport: "Activer le bouton de support",
        callSuportHelp: "Active ou désactive la fonction d'appel direct au support technique via le système. Essentiel pour résoudre rapidement les problèmes, offrant une solution immédiate aux problèmes techniques des utilisateurs.",
        displayContactInfo: "Afficher le numéro de téléphone",
        displayContactInfoHelp: "Définit si le numéro de téléphone sera affiché à la place du nom du contact. Utile dans les situations où le nom du client peut ne pas être connu, permettant une organisation efficace basée sur le numéro de téléphone.",
        displayBusinessInfo: "Afficher les données commerciales du contact",
        displayBusinessInfoHelp: "Définit si les données commerciales (entreprise et poste) seront affichées à l'écran de l'assistance. Utile pour personnaliser l'assistance en fonction du profil professionnel du contact.",
        trialExpiration: "Jours d'essai gratuit",
        trialExpirationHelp: "Définit le nombre de jours disponibles pour l'essai gratuit du système. Crucial pour attirer de nouveaux clients, offrant une expérience complète du système avant l'achat.",
        enableMetaPixel: "Activer le Pixel de Meta",
        enableMetaPixelHelp: "Active l'utilisation du Pixel de Meta pour toutes les entreprises",
        metaPixelEnabled: "Pixel de Meta activé avec succès",
        metaPixelDisabled: "Pixel de Meta désactivé avec succès",
        metaPixelSettings: "Paramètres du Pixel de Meta",
        metaPixelId: "ID du Pixel de Meta",
        metaPixelIdHelp: "Entrez l'ID du Pixel de Meta pour le suivi des conversions",
        saveMetaPixelSettings: "Enregistrer les paramètres du Pixel",
        enableGroupTool: "Activer le Gestionnaire de Groupes",
        enableGroupToolHelp: "Permet l'utilisation d'outils avancés pour la gestion de groupes",
        groupToolEnabled: "Gestionnaire de Groupes activé avec succès",
        groupToolDisabled: "Gestionnaire de Groupes désactivé avec succès",
        enableMessageRules: "Activer les Règles de Messages",
        enableMessageRulesHelp: "Permet la création et la gestion de règles pour les messages",
        messageRulesEnabled: "Règles de Messages activées avec succès",
        messageRulesDisabled: "Règles de Messages désactivées avec succès",
        enableUPSix: "Activer l'intégration avec UPSix",
        enableUPSixHelp: "Active ou désactive l'intégration avec UPSix dans le système.",
        upsixEnabled: "Intégration avec UPSix activée.",
        upsixDisabled: "Intégration avec UPSix désactivée.",
        enableUPSixWebphone: "Activer le webphone UPSix",
        enableUPSixWebphoneHelp: "Active ou désactive l'utilisation du webphone intégré d'UPSix.",
        enableUPSixNotifications: "Activer les notifications UPSix",
        enableUPSixNotificationsHelp: "Active ou désactive les notifications via UPSix.",
        whatsappApiEnabled: "API officielle de WhatsApp activée.",
        whatsappApiDisabled: "API officielle de WhatsApp désactivée.",
        support: "Support",
        wasuport: "Support WhatsApp",
        msgsuport: "Message prédéfini",
        apiToken: "Token d'API",
        apiTokenHelp: "Token d'accès pour l'intégration avec une API externe.",
        generateToken: "Générer un nouveau jeton",
        copyToken: "Copier le token",
        deleteToken: "Supprimer le jeton",
        tokenCopied: "Token copié dans le presse-papiers",
        smtpServer: "Serveur SMTP",
        smtpUser: "Utilisateur SMTP",
        smtpPassword: "Mot de passe SMTP",
        smtpPort: "Port SMTP",
        smtpHelp: "Paramètres du serveur SMTP pour l'envoi d'e-mails par le système.",
        days: "jours"
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Il doit y avoir au moins un WhatsApp par défaut.",
        ERR_CONNECTION_NOT_CONNECTED: "La connexion liée au ticket n'est pas connectée sur la plateforme, veuillez vérifier la page des connexions.",
        ERR_NO_DEF_WAPP_FOUND: "Aucun WhatsApp par défaut trouvé. Veuillez vérifier la page des connexions.",
        ERR_WAPP_NOT_INITIALIZED: "Cette session WhatsApp n'a pas été initialisée. Veuillez vérifier la page des connexions.",
        ERR_WAPP_CHECK_CONTACT: "Impossible de vérifier le contact WhatsApp. Veuillez vérifier la page des connexions.",
        ERR_WAPP_INVALID_CONTACT: "Ce n'est pas un numéro de Whatsapp valide.",
        ERR_WAPP_DOWNLOAD_MEDIA: "Impossible de télécharger des médias depuis WhatsApp. Veuillez vérifier la page des connexions.",
        ERR_INVALID_CREDENTIALS: "Erreur d'authentification. Veuillez réessayer.",
        ERR_SENDING_WAPP_MSG: "Erreur lors de l'envoi du message WhatsApp. Veuillez vérifier la page des connexions.",
        ERR_DELETE_WAPP_MSG: "Impossible de supprimer le message WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Il y a déjà un ticket ouvert pour ce contact.",
        ERR_SESSION_EXPIRED: "Session expirée. Veuillez vous connecter.",
        ERR_USER_CREATION_DISABLED: "La création de l'utilisateur a été désactivée par l'administrateur.",
        ERR_NO_PERMISSION: "Vous n'avez pas la permission d'accéder à cette ressource.",
        ERR_DUPLICATED_CONTACT: "Il existe déjà un contact avec ce numéro.",
        ERR_NO_SETTING_FOUND: "Aucune configuration trouvée avec cet ID.",
        ERR_NO_CONTACT_FOUND: "Aucun contact trouvé avec cet ID.",
        ERR_NO_TICKET_FOUND: "Aucun ticket trouvé avec cet ID.",
        ERR_NO_USER_FOUND: "Aucun utilisateur trouvé avec cet ID.",
        ERR_NO_WAPP_FOUND: "Aucun WhatsApp trouvé avec cet ID.",
        ERR_NO_TAG_FOUND: "Aucune étiquette trouvée",
        ERR_CREATING_MESSAGE: "Erreur lors de la création du message dans la base de données.",
        ERR_CREATING_TICKET: "Erreur lors de la création du ticket dans la base de données.",
        ERR_FETCH_WAPP_MSG: "Erreur lors de la recherche du message sur WhatsApp, il est peut-être trop ancien.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS: "Cette couleur est déjà utilisée, veuillez en choisir une autre.",
        ERR_WAPP_GREETING_REQUIRED: "Le message de salutation est obligatoire lorsqu'il y a plus d'un secteur.",
        ERR_NO_USER_DELETE: "Não é possível excluir usuário Super",
        ERR_OUT_OF_HOURS: "Hors des heures de bureau!",
        ERR_QUICKMESSAGE_INVALID_NAME: "Nome inválido",
        ERR_EDITING_WAPP_MSG: "Não foi possível editar a mensagem do WhatsApp",
        ERR_CREATE_CONTACT_MSG: "Oops! Une erreur s'est produite lors de la création du contact, veuillez rafraîchir la page et réessayer. Si le problème persiste, veuillez contacter le support technique.",
        ERR_ACCESS_ANOTHER_COMPANY: "Não é possível acessar registros de outra empresa",
        ERR_THE_NUMBER: "O número",
        ERR_THE_NUMBER_IS_NOT_PRESENT_WITHIN_THE_GROUP: "não está presente dentro do grupo para realizar a extração dos contatos. É necessário que o mesmo esteja dentro do grupo para realizar a ação.",
        ERR_GENERIC: "Oups! Une erreur s'est produite, veuillez rafraîchir la page et réessayer. Si le problème persiste, veuillez contacter le support technique.",
        ERR_NAME_INTEGRATION_ALREADY_EXISTS: "Ce nom d'intégration est déjà utilisé.",
        ERR_NAME_INTEGRATION_OPENAI_ALREADY_EXISTS: "L'intégration avec OpenAI est déjà utilisée.",
        ERR_NAME_INTEGRATION_MIN_2: "Le nom doit comporter au moins 2 caractères.",
        ERR_NAME_INTEGRATION_MAX_50: "Le nom doit comporter au maximum 50 caractères.",
        ERR_NAME_INTEGRATION_REQUIRED: "Le nom est obligatoire.",
        ERR_ACCESS_ANOTHER_COMPANY_INTEGRATION: "Impossible d'utiliser l'intégration d'une autre entreprise.",
        ERR_NEED_COMPANY_ID_OR_TOKEN_DATA: "CompanyId ou tokenData est nécessaire.",
        ERR_ONLY_ACTIVE_USER_OR_ADMIN_CAN_EDIT_TICKET: "Seul l'utilisateur actif du ticket ou l'administrateur peut apporter des modifications au ticket.",
        ERR_WHATSAPP_LINK_ERROR: "Une erreur s'est produite lors de la tentative de localisation du WhatsApp associé à l'utilisateur.",
        ERR_WHATSAPP_DEFAULT_NOT_FOUND: "WhatsApp par défaut non trouvé.",
        ERR_WBOT_NOT_FOUND: "Wbot non trouvé.",
        ERR_SMTP_URL_NOT_FOUND: "Configuration de l'URL SMTP non trouvée.",
        ERR_SMTP_USER_NOT_FOUND: "Configuration de l'utilisateur SMTP non trouvée.",
        ERR_SMTP_PASSWORD_NOT_FOUND: "Configuration du mot de passe SMTP non trouvée.",
        ERR_SMTP_PORT_NOT_FOUND: "Configuration du port SMTP non trouvée.",
        ERR_EMAIL_SENDING: "Oops! Une erreur s'est produite lors de l'envoi de l'e-mail.",
        ERR_WHATSAPP_NOT_FOUND: "Impossible de trouver le WhatsApp associé à l'utilisateur.",
        ERR_CONTACT_HAS_OPEN_TICKET: "Il y a déjà une assistance ouverte pour ce contact.",
        ERR_TICKET_NOT_FOUND: "Ticket non trouvé.",
        ERR_SKU_REQUIRED: "SKU est obligatoire.",
        ERR_SKU_VALUE_REQUIRED: "La valeur du SKU est obligatoire.",
        ERR_INVALID_TICKET_ID: "ID de ticket fourni invalide.",
        ERR_WORK_HOURS_UNDEFINED: "Les horaires de travail n'ont pas été définis.",
        ERR_INVALID_URL: "L'URL fournie n'est pas valide! Veuillez vérifier si les données d'authentification sont correctes dans l'écran de configuration du système et réessayez.",
        ERR_INTERNAL_SERVER_ERROR: "Une erreur interne du serveur s'est produite.",
        ERR_CONNECTION_NOT_PROVIDED: "Connexion non spécifiée.",
        ERR_INVALID_NUMBER_FORMAT: "Format de numéro invalide. Seuls les chiffres sont autorisés.",
        ERR_QUICKMESSAGE_MIN_3_CARACTERES: "Le message doit contenir au moins 3 caractères.",
        ERR_SHORTCUT_MIN_3_CHARACTERS: "Le raccourci doit contenir au moins 3 caractères.",
        ERR_NO_FILE_UPLOADED_QUICK_MESSAGE: "Aucun fichier n'a été envoyé.",
        ERR_QUICK_MESSAGE_NOT_FOUND: "Message rapide non trouvé.",
        ERR_UNAUTHENTICATED_OR_UNIDENTIFIED_COMPANY: "Utilisateur non authentifié ou entreprise non identifiée.",
        ERR_SHORTCODE_REQUIRED: "Le raccourci est obligatoire.",
        ERR_MESSAGE_REQUIRED: "Le message est obligatoire.",
        ERR_QUICKMESSAGE_REQUIRED: "La réponse rapide est obligatoire.",
        ERR_FILE_EXTENSION_NOT_ALLOWED: "Type de fichier non autorisé sur la plateforme. Veuillez essayer un autre type de fichier."
      }
    }
  }
};

export { messages };