import { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import { 
  Chip, 
  Paper, 
  TextField,
  Autocomplete,
  Box
} from "@mui/material";
import { createFilterOptions } from '@mui/material/Autocomplete';
import { useTransition, animated } from "@react-spring/web";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { isArray, isString } from "../../utils/helpers";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const StyledAutocompletePaper = styled(Paper)(({ theme }) => ({
  width: 400,
  marginTop: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  backgroundColor: theme.palette.background.paper,
}));

const StyledChip = styled(Chip)(({ theme, backgroundcolor }) => ({
  backgroundColor: backgroundcolor || theme.palette.primary.main,
  color: theme.palette.getContrastText(backgroundcolor || theme.palette.primary.main),
  marginRight: theme.spacing(0.5),
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.75rem",
  height: 24,
  '& .MuiChip-label': {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    '& input': {
      padding: theme.spacing(0.5, 1),
      fontSize: '0.875rem'
    }
  }
}));

export function TagsContainer({ ticket }) {
    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const isMounted = useRef(true);

    const transitions = useTransition(selecteds, {
      keys: (item) => item.id || item.name,
      from: { opacity: 0, transform: 'scale(0.8)' },
      enter: { opacity: 1, transform: 'scale(1)' },
      leave: { opacity: 0, transform: 'scale(0.8)' },
      config: { tension: 500, friction: 30 }
    });

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (isMounted.current) {
            loadTags().then(() => {
                if (Array.isArray(ticket.tags)) {
                    setSelecteds(ticket.tags);
                } else {
                    setSelecteds([]);
                }
            });
        }
    }, [ticket]);

    const createTag = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags`, data);
            return responseData;
        } catch (err) {
            toast.error(err);
        }
    }

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toast.error(err);
        }
    }

    const syncTags = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags/sync`, data);
            return responseData;
        } catch (err) {
            toast.error(err);
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            const inputValue = event.target.value;
            if (inputValue?.trim()) {
                onChange([...selecteds, inputValue], 'create-option');
            }
        }
    };

    const onChange = async (value, reason, e) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    if (isString(item) && item?.trim()) {
                        const newTag = await createTag({ name: item?.trim() })
                        optionsChanged.push(newTag);
                    } else {
                        optionsChanged.push(item);
                    }
                }
            }
            await loadTags();
        } else {
            optionsChanged = value;
        }

        if (reason === 'removeOption' && !value?.length){
            await syncTags({ ticketId: ticket.id, tags: [] });
        }
        
        setSelecteds(optionsChanged);
        if (optionsChanged?.length) {
            await syncTags({ ticketId: ticket.id, tags: optionsChanged });
        }
    }

    return (
        <StyledPaper elevation={1}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                freeSolo
                noOptionsText={i18n.t('tags.noRecordsFound')}
                onChange={(e, v, r) => onChange(v, r, e)}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {transitions((style, item, _, index) => (
                      <animated.div style={style}>
                        {item?.name?.trim() && (
                          <StyledChip
                            backgroundcolor={item.color}
                            label={item?.name?.toUpperCase()}
                            {...getTagProps({ index })}
                          />
                        )}
                      </animated.div>
                    ))}
                  </Box>
                )}
                renderInput={(params) => (
                    <StyledTextField
                        {...params}
                        variant="outlined"
                        placeholder={i18n.t('tags.placeholder')}
                        onKeyDown={handleKeyDown}
                    />
                )}
                PaperComponent={({ children }) => (
                    <StyledAutocompletePaper>
                        {children}
                    </StyledAutocompletePaper>
                )}
                sx={{
                  '& .MuiAutocomplete-inputRoot': {
                    padding: 0.5
                  }
                }}
            />
        </StyledPaper>
    )
}