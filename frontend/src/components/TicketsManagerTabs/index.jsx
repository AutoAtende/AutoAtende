import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/material/styles/useTheme';
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "@mui/material/Badge";
import GroupIcon from "@mui/icons-material/Group";
import {
    Group,
    MoveToInbox as MoveToInboxIcon,
    CheckBox as CheckBoxIcon,
    MessageSharp as MessageSharpIcon,
    PlaylistAddCheckOutlined as PlaylistAddCheckOutlinedIcon,
    AccessTime as ClockIcon,
    Search as SearchIcon,
    Add as AddIcon,
    MoreVertOutlined as MoreVertIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import { Snackbar, Tooltip } from "@mui/material";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import ChatIcon from '@mui/icons-material/Chat';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TicketsListGroup from "../TicketsListGroup";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketManager } from "../../context/Socket/SocketContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button, grid } from "@mui/material";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";
import useSettings from "../../hooks/useSettings";
import IconButton from "@mui/material/IconButton";
import api from "../../services/api";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { ToggleButton } from '@mui/material';
import { DatePickerMoment } from '../DatePickerMoment';
import { CloseAllTicketsButton } from "./CloseAllTicketsButton";
import { GlobalContext } from "../../context/GlobalContext";

import { toast } from "../../helpers/toast";
import { debounce } from "../../utils/helpers";


const useStyles = makeStyles(theme => ({
    tabsBadge: {
        width: 90
    },
    ticketsWrapper: {
        position: "relative",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    tabsHeader: {
        flex: "none",
        backgroundColor: theme.palette.tabHeaderBackground,
    },

    tabsInternal: {
        flex: "none",
        backgroundColor: theme.palette.tabHeaderBackground
    },

    settingsIcon: {
        alignSelf: "center",
        marginLeft: "auto",
        padding: 8,
    },

    tab: {
        minWidth: 60,
        width: 60,
        transition: 'all 0.3s ease',
        '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 'bold',
            '& .MuiSvgIcon-root': {
                color: theme.palette.primary.contrastText,
            },
            '& .MuiBadge-badge': {
                backgroundColor: theme.palette.primary.contrastText,
                color: theme.palette.primary.main,
            },
        },
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },

    internalTab: {
        minWidth: 60,
        width: 60,
        padding: 5
    },

    ticketOptionsBox: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: theme.palette.optionsBackground,
        padding: theme.spacing(1),
    },

    ticketSearchLine: {
        padding: theme.spacing(1),
    },

    serachInputWrapper: {
        flex: 1,
        background: theme.palette.total,
        display: "flex",
        borderRadius: 40,
        padding: 4,
        marginRight: theme.spacing(1),
    },

    searchIcon: {
        color: "grey",
        marginLeft: 6,
        marginRight: 6,
        alignSelf: "center",
    },

    searchInput: {
        flex: 1,
        border: "none",
        borderRadius: 25,
        outline: "none",
    },

    badge: {
        right: "-10px",
    },
    show: {
        display: "block",
    },
    hide: {
        display: "none !important",
    },

    insiderTabPanel: {
        height: '100%',
        marginTop: "-72px",
        paddingTop: "72px"
    },

    insiderDoubleTabPanel: {
        display: "flex",
        flexDirection: "column",
        marginTop: "-72px",
        paddingTop: "72px",
        height: "100%"
    },

    snackbar: {
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: theme.palette.primary.main,
        color: "white",
        borderRadius: 30,
        [theme.breakpoints.down('md')]: {
            fontSize: "0.8em",
        },
        [theme.breakpoints.up("md")]: {
            fontSize: "1em",
        },
    },

    labelContainer: {
        width: "auto",
        padding: 0
    },
    iconLabelWrapper: {
        flexDirection: "row",
        '& > *:first-child': {
            marginBottom: '3px !important',
            marginRight: 16
        }
    },
    insiderTabLabel: {
        [theme.breakpoints.down(1600)]: {
            display: 'none'
        }
    },
    smallFormControl: {
        '& .MuiOutlinedInput-input': {
            padding: "12px 10px",
        },
        '& .MuiInputLabel-outlined': {
            marginTop: "-6px"
        }
    },
    rotating: {
        animation: "$spin 1s linear infinite",
    },
    "@keyframes spin": {
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(360deg)" },
    },
    iconButton: {
        padding: 8,
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            borderRadius: '50%',
        },
        transition: 'all 0.2s ease-in-out'
    },
}));

const TicketsManagerTabs = () => {
    const classes = useStyles();
    const history = useHistory();
    const theme = useTheme();

    const [searchParam, setSearchParam] = useState("");
    const [tab, setTab] = useState("open");
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [showAllTickets, setShowAllTickets] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isHoveredRefresh, setIsHoveredRefresh] = useState(false);
    const searchInputRef = useRef();
    const { user } = useContext(AuthContext);
    const { profile, allTicket } = user;
    const { settings } = useSettings();
    const [showGroupTab, setShowGroupTab] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState("private");

    const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);
    const { tabOpen, setTabOpen, setMakeRequestTagTotalTicketPending, setMakeRequestTicketList } = useContext(GlobalContext);

    const [openCount, setOpenCount] = useState(0);
    const [groupOpenCount, setGroupOpenCount] = useState(0);
    const [groupPendingCount, setGroupPendingCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    //const [chatbotCount, setChatbotCount] = useState(0);
    const userQueueIds = user.queues.map((q) => q.id);
    const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [hoveredButton, setHoveredButton] = useState(null);
    const [isHoveredAll, setIsHoveredAll] = useState(false);
    const [isHoveredNew, setIsHoveredNew] = useState(false);
    const [isHoveredResolve, setIsHoveredResolve] = useState(false);
    const [isHoveredOpen, setIsHoveredOpen] = useState(false);
    const [isHoveredClosed, setIsHoveredClosed] = useState(false);
    const [isShowButtonCloseAll, setIsShowButtonCloseAll] = useState(true)

    useEffect(async () => {

        setSelectedQueuesMessage(selectedQueueIds);

        // Ativa a exibição de todos os tickets para administradores
        if (user.profile.toUpperCase() === "ADMIN") {
            setShowAllTickets(true);
        }

        // Foca o input de pesquisa quando a aba de pesquisa é selecionada
        if (tab === "search") {
            searchInputRef.current.focus();
        }

        // Configura a exibição da aba de grupo baseada nas configurações
        const checkMsgIsGroupSetting = settings?.CheckMsgIsGroup;
        if (checkMsgIsGroupSetting) {
            setShowGroupTab(checkMsgIsGroupSetting.value === "disabled");
        }

        const enableReasonWhenCloseTicket = settings?.enableReasonWhenCloseTicket
        if (enableReasonWhenCloseTicket?.value === 'enabled') {
            setIsShowButtonCloseAll(false)
        } else {
            setIsShowButtonCloseAll(true)
        }

    }, [selectedQueueIds, user.profile, tab]); // Dependências atualizadas para refletir todos os estados usados dentro do useEffect


    let searchTimeout;

    useEffect(() => {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;
        
        const socket = socketManager.GetSocket(companyId);
        if (!socket) return;
        
        const handleTicketEvent = (data) => {
          if (data.action === "update") {
            if (data.ticket.status === "closed") {
              // Se o ticket foi fechado, atualiza os contadores
              setMakeRequestTagTotalTicketPending(Math.random());
              setMakeRequestTicketList(Math.random());
            } else if (data.ticket.status === "open") {
              setTabOpen("open");
            }
          }
          if (data.action === "delete") {
            setMakeRequestTagTotalTicketPending(Math.random());
            setMakeRequestTicketList(Math.random());
          }
            // Em qualquer caso, atualiza a lista de tickets
            setMakeRequestTagTotalTicketPending(Math.random());
            setMakeRequestTicketList(Math.random());
        };
      
        socket.on(`company-${companyId}-ticket`, handleTicketEvent);
        
        return () => {
          socket.off(`company-${companyId}-ticket`, handleTicketEvent);
        };
    }, []);

    // Função para atualizar a listagem de tickets
    const handleRefreshTickets = () => {
        setRefreshing(true);
        
        // Força atualização das listas usando variáveis do contexto global
        setMakeRequestTagTotalTicketPending(Math.random());
        setMakeRequestTicketList(Math.random());
        
        // Define o tempo para a animação do ícone de atualização
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const handleSearchInput = debounce((searchedTerm) => {
        setSearchParam(searchedTerm);
    }, 300); // 300ms de debounce

    const handleSearch = (e) => {
        const searchedTerm = e.target.value.toLowerCase();
        handleSearchInput(searchedTerm)
    };

    const handleChangeTab = (e, newValue) => {
        setTab(newValue);
    };

    const handleChangeSubTab = (e, newValue) => {
        setActiveSubTab(newValue);
    };

    const handleChangeTabOpen = (e, newValue) => {
        setTabOpen(newValue);
    };

    const applyPanelStyle = (status) => {
        if (tabOpen !== status) {
            return { width: 0, height: 0 };
        }
    };

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.uuid !== undefined) {
            history.push(`/tickets/${ticket.uuid}`);
        }
    };


    const handleSelectedTags = (selecteds) => {
        if (!selecteds || selecteds.length === 0) {
            setSelectedTags([]);
            return;
        }
        const tags = selecteds.map((t) => t.id);
        setSelectedTags(tags);
    };

    const handleSelectedUsers = (selectedUserIds) => {
        setSelectedUsers(selectedUserIds);
    };

    // Reset dos filtros ao trocar de aba
    useEffect(() => {
        if (tab !== "search") {
            setSelectedTags([]);
            setSelectedUsers([]);
            setSearchParam("");
        }
    }, [tab]);

    return (
        <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
            {!!newTicketModalOpen && <NewTicketModal
                modalOpen={newTicketModalOpen}
                onClose={(ticket) => {

                    handleCloseOrOpenTicket(ticket);
                }}
            />}
            <Paper elevation={0} square className={classes.tabsHeader}>
                <Tabs
                    value={tab}
                    onChange={handleChangeTab}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="icon label tabs example"
                    TabIndicatorProps={{
                        style: {
                            height: 4,
                            borderRadius: '4px 4px 0 0'
                        }
                    }}
                >
                    <Tooltip title={i18n.t("tickets.tabs.open.title")} arrow>
                        <Tab
                            value={"open"}
                            icon={<ChatIcon />}
                            label={
                                <Badge
                                    className={classes.badge}
                                    badgeContent={openCount + pendingCount}
                                    color="primary"
                                >
                                </Badge>
                            }
                            classes={{ root: classes.tab }}
                        />
                    </Tooltip>
                    {showGroupTab && (
                        <Tooltip title={i18n.t("tickets.tabs.group.title")} arrow>
                            <Tab
                                value={"group"}
                                icon={<GroupIcon />}
                                label={
                                    <Badge className={classes.badge} badgeContent={groupOpenCount + groupPendingCount} color="primary">
                                    </Badge>
                                }
                                classes={{ root: classes.tab }}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title={i18n.t("tickets.tabs.closed.title")} arrow>
                        <Tab
                            value={"closed"}
                            icon={<DoneAllIcon />}
                            classes={{ root: classes.tab }}
                        />
                    </Tooltip>
                    <Tooltip title={i18n.t("tickets.tabs.search.title")} arrow>
                        <Tab
                            value={"search"}
                            icon={<SearchIcon />}
                            classes={{ root: classes.tab }}
                        />
                    </Tooltip>
                </Tabs>
            </Paper>
            <Paper square elevation={0} className={classes.ticketOptionsBox}>
                <div>
                    {tab === "search" ? (
                        <div className={classes.serachInputWrapper}>
                            <SearchIcon className={classes.searchIcon} sx={{ color: theme.palette.primary.main }}/>
                            <InputBase
                                className={classes.searchInput}
                                inputRef={searchInputRef}
                                placeholder={i18n.t("tickets.search.placeholder")}
                                type="search"
                                onChange={handleSearch}
                            />
                        </div>
                    ) : (
                        <>                            
                            {/* Botão de atualização */}
                            <Tooltip title={i18n.t("tickets.buttons.refresh")} arrow>
                                <IconButton
                                    onMouseEnter={() => setIsHoveredRefresh(true)}
                                    onMouseLeave={() => setIsHoveredRefresh(false)}
                                    className={classes.iconButton}
                                    onClick={handleRefreshTickets}
                                    size="large"
                                >
                                    <RefreshIcon 
                                        className={refreshing ? classes.rotating : classes.icon} 
                                        sx={{ color: theme.palette.primary.main }}
                                    />
                                </IconButton>
                            </Tooltip>
                            
                            {(user.allTicket === 'enabled' || user.profile === 'admin' || user.profile === 'superv') && (
                                <Tooltip title={showAllTickets ? "Ocultar Todos" : "Ver Todos"} arrow>
                                    <IconButton
                                        onMouseEnter={() => setIsHoveredAll(true)}
                                        onMouseLeave={() => setIsHoveredAll(false)}
                                        className={classes.iconButton}
                                        onClick={() => setShowAllTickets(!showAllTickets)}
                                        size="large"
                                    >
                                        {showAllTickets ? (
                                            <VisibilityIcon className={classes.icon} sx={{ color: theme.palette.primary.main }}/>
                                        ) : (
                                            <VisibilityOffIcon className={classes.icon} sx={{ color: theme.palette.primary.main }}/>
                                        )}
                                    </IconButton>
                                </Tooltip>
                            )}
                            {
                                (tab === 'open' || tab === 'closed') && (
                                    <Tooltip title={i18n.t("ticketsManager.buttons.newTicket")} arrow>
                                        <IconButton
                                            onMouseEnter={() => setIsHoveredNew(true)}
                                            onMouseLeave={() => setIsHoveredNew(false)}
                                            className={classes.iconButton}
                                            onClick={() => {
                                                setNewTicketModalOpen(true);
                                            }}
                                            size="large">
                                            <AddIcon className={classes.icon} sx={{ color: theme.palette.primary.main }}/>
                                        </IconButton>
                                    </Tooltip>
                                )
                            }

                            {user.profile === "admin" && isShowButtonCloseAll && (
                                <CloseAllTicketsButton 
                                tabOpen={tabOpen}
                                selectedQueueIds={selectedQueueIds}
                                isShowButtonCloseAll={isShowButtonCloseAll}
                                companyId={user.companyId}
                                />
                            )}

                        </>
                    )}
                </div>
                <TicketsQueueSelect
                    style={{ marginLeft: 6 }}
                    selectedQueueIds={selectedQueueIds}
                    userQueues={user?.queues}
                    onChange={(values) => setSelectedQueueIds(values)}
                />
            </Paper>
            <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
                <Tabs
                    value={tabOpen}
                    onChange={handleChangeTabOpen}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab
                        label={
                            <Badge
                                className={classes.badge}
                                badgeContent={openCount}
                                color="primary"
                            >
                                {i18n.t("ticketsList.assignedHeader")}
                            </Badge>
                        }
                        value={"open"}
                    />
                    <Tab
                        label={
                            <Badge
                                className={classes.badge}
                                badgeContent={pendingCount}
                                color="secondary"
                            >
                                {i18n.t("ticketsList.pendingHeader")}
                            </Badge>
                        }
                        value={"pending"}
                    />
                </Tabs>
                <Paper className={classes.ticketsWrapper}>
                    <TicketsList
                        status="open"
                        setTabOpen={setTabOpen}
                        showAll={showAllTickets}
                        selectedQueueIds={selectedQueueIds}
                        updateCount={(val) => setOpenCount(val)}
                        updateGroupCount={(val) => setGroupOpenCount(val)}
                        style={applyPanelStyle("open")}
                        refreshTickets={refreshing}
                    />

                    <TicketsList
                        chatbot={false}
                        status="pending"
                        setTabOpen={setTabOpen}
                        selectedQueueIds={selectedQueueIds}
                        updateGroupCount={(val) => setGroupPendingCount(val)}
                        updateCount={(val) => setPendingCount(val)}
                        style={applyPanelStyle("pending")}
                        refreshTickets={refreshing}
                    />
                </Paper>
            </TabPanel>
            <TabPanel value={tab} name="group" className={classes.ticketsWrapper}>
                <Tabs
                    value={tabOpen}
                    onChange={handleChangeTabOpen}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab
                        label={
                            <Badge
                                className={classes.badge}
                                badgeContent={groupOpenCount}
                                color="primary"
                            >
                                {i18n.t("ticketsList.assignedHeader")}
                            </Badge>
                        }
                        value={"open"}
                    />
                    <Tab
                        label={
                            <Badge
                                className={classes.badge}
                                badgeContent={groupPendingCount}
                                color="secondary"
                            >
                                {i18n.t("ticketsList.pendingHeader")}
                            </Badge>
                        }
                        value={"pending"}
                    />
                </Tabs>
                <Paper className={classes.ticketsWrapper}>
                    <TicketsListGroup
                        status="open"
                        setTabOpen={setTabOpen}
                        showAll={showAllTickets}
                        selectedQueueIds={selectedQueueIds}
                        updateCount={(val) => {
                            setGroupOpenCount(val);
                        }
                        }
                        style={applyPanelStyle("open")}
                        refreshTickets={refreshing}
                    />
                    <TicketsListGroup
                        status="pending"
                        setTabOpen={setTabOpen}
                        selectedQueueIds={selectedQueueIds}
                        updateCount={(val) => setGroupPendingCount(val)}
                        style={applyPanelStyle("pending")}
                        refreshTickets={refreshing}
                    />
                </Paper>
            </TabPanel>
            {(user.profile === "admin" || user.profile === "superv" || (user.profile === "user" && user.allTicket === "enabled")) && (
                <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
                    <Tabs
                        value={activeSubTab}
                        onChange={handleChangeSubTab}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab
                            label={i18n.t("tickets.tabs.private.title")}
                            value={"private"}
                        />
                        {showGroupTab && (
                            <Tab
                                label={i18n.t("tickets.tabs.group.title")}
                                value={"group"}
                            />
                        )}
                    </Tabs>
                    <Divider />
                    {activeSubTab === "private" && (
                        <TicketsList
                            status="closed"
                            showAll={showAllTickets}
                            selectedQueueIds={selectedQueueIds}
                            setTabOpen={setTabOpen}
                            refreshTickets={refreshing}
                        />
                    )}
                    {activeSubTab === "group" && (
                        <>
                            <Divider />
                            <TicketsListGroup
                                status="closed"
                                showAll={true}
                                selectedQueueIds={selectedQueueIds}
                                setTabOpen={setTabOpen}
                                refreshTickets={refreshing}
                            />
                        </>
                    )}
                </TabPanel>
            )}
            <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
                <TagsFilter onFiltered={handleSelectedTags} />
                {(profile === 'admin' || profile === 'superv') && (
                    <UsersFilter onFiltered={handleSelectedUsers} />
                )}
                <TicketsList
                    searchParam={searchParam}
                    showAll={true}
                    tags={selectedTags}
                    users={selectedUsers}
                    selectedQueueIds={selectedQueueIds}
                    setTabOpen={setTabOpen}
                    refreshTickets={refreshing}
                    filterType="search"
                />
            </TabPanel>
        </Paper>
    );
};

export default TicketsManagerTabs;