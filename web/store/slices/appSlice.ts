import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getAllWords, getWordById, addWord } from '@/firebase/words';
import { getAllCategories } from '@/firebase/categories';
import { getUserWords, addWordToUser, removeWordFromUser } from '@/firebase/accounts';

interface AppState {
    words: any[];
    categories: any[];
    userWords: any[]; // Full word objects
    loading: boolean;
    error: string | null;
    initialized: boolean;
}

const initialState: AppState = {
    words: [],
    categories: [],
    userWords: [],
    loading: false,
    error: null,
    initialized: false,
};

// --- Thunks ---

export const fetchAppData = createAsyncThunk(
    'app/fetchAppData',
    async (userId: string, { getState }) => {
        // Optimization: If already initialized, maybe skip? 
        // But for now, let's just fetch to ensure fresh data on first load/refresh
        try {
            const [allWords, allCategories, userWordIds] = await Promise.all([
                getAllWords(),
                getAllCategories(),
                getUserWords(userId)
            ]);

            // Optimization: Filter words locally if needed, but getAllWords fetches all
            // Map userWordIds to actual objects from allWords to save reads?
            // If allWords contains EVERYTHING, we can just find them.
            // But getWordById might fetch individual docs if not in the list?
            // Assuming getAllWords retrieves ALL global words.

            const userWordsList = allWords.filter((w: any) => userWordIds.includes(w.id));

            // If some user words are NOT in global list (deleted?), we might miss them.
            // But generally they should be there.

            return {
                words: allWords,
                categories: allCategories,
                userWords: userWordsList
            };
        } catch (error) {
            throw error;
        }
    }
);

export const addUserWord = createAsyncThunk(
    'app/addUserWord',
    async ({ userId, wordData }: { userId: string, wordData: any }, { getState, rejectWithValue }) => {
        const state = getState() as any;

        // Check if word pair already exists in user's words
        const isDuplicate = state.app.userWords.some((w: any) =>
            w.eng === wordData.eng && w.tr === wordData.tr
        );

        if (isDuplicate) {
            return rejectWithValue("Bu kelime çifti zaten listenizde mevcut");
        }

        try {
            const newWord = await addWord(wordData);
            await addWordToUser(userId, newWord.id);
            return newWord; // This is the full word object to add to userWords
        } catch (error) {
            throw error;
        }
    }
);

export const removeUserWord = createAsyncThunk(
    'app/removeUserWord',
    async ({ userId, wordId }: { userId: string, wordId: string }) => {
        await removeWordFromUser(userId, wordId);
        return wordId;
    }
);

export const updateUserWord = createAsyncThunk(
    'app/updateUserWord',
    async ({ userId, oldWordId, newWordData }: { userId: string, oldWordId: string, newWordData: any }, { dispatch }) => {
        try {
            // 1. Add new word (or get existing)
            const newWord = await addWord(newWordData);

            // 2. Add new to user
            await addWordToUser(userId, newWord.id);

            // 3. Remove old if different
            if (newWord.id !== oldWordId) {
                await removeWordFromUser(userId, oldWordId);
            }

            // Return details to update state
            return {
                oldWordId,
                newWord,
                isSameId: newWord.id === oldWordId
            };
        } catch (error) {
            throw error;
        }
    }
);

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        // Synchronous actions if needed
        clearState: (state) => {
            state.userWords = [];
            state.words = [];
            state.initialized = false;
        }
    },
    extraReducers: (builder) => {
        // Fetch App Data
        builder.addCase(fetchAppData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAppData.fulfilled, (state, action) => {
            state.loading = false;
            state.words = action.payload.words;
            state.categories = action.payload.categories;
            state.userWords = action.payload.userWords;
            state.initialized = true;
        });
        builder.addCase(fetchAppData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Failed to load data';
        });

        // Add User Word
        builder.addCase(addUserWord.fulfilled, (state, action) => {
            // Add to global words if not exists
            const existsInGlobal = state.words.find(w => w.id === action.payload.id);
            if (!existsInGlobal) {
                state.words.push(action.payload);
            }

            // Add to user words only if not already there (safety check)
            const existsInUser = state.userWords.find(w => w.id === action.payload.id);
            const isDuplicatePair = state.userWords.some(w =>
                w.eng === action.payload.eng && w.tr === action.payload.tr
            );

            if (!existsInUser && !isDuplicatePair) {
                state.userWords.push(action.payload);
            }
        });

        // Remove User Word
        builder.addCase(removeUserWord.fulfilled, (state, action) => {
            state.userWords = state.userWords.filter(w => w.id !== action.payload);
        });

        // Update User Word
        builder.addCase(updateUserWord.fulfilled, (state, action) => {
            const { oldWordId, newWord, isSameId } = action.payload;

            // Update global words if new
            const exists = state.words.find(w => w.id === newWord.id);
            if (!exists) {
                state.words.push(newWord);
            }

            if (isSameId) {
                // If ID is same (meaning we just updated the content in place? 
                // Wait, addWord usually returns a NEW ID if distinct, or SAME ID if identical content found.
                // If content CHANGED, it matches a different word or creates new. 
                // So ID effectively changes or switches to another existing one.
                // If it returned same ID, it implies no change in identity, but we might have updated fields?
                // Actually my AddWord logic checks uniqueness. If I edit "Book" to "Books", it finds/creates "Books". 
                // "Book" remains.
                // So ID SHOULD change.
                // If I edit "Book" to "BOOK" (case change), it might normalize and find same.
            } else {
                // Remove old, add new
                state.userWords = state.userWords.filter(w => w.id !== oldWordId);
                // Check if new word is already in user list? (Maybe user has both meanings?)
                const alreadyInList = state.userWords.find(w => w.id === newWord.id);
                if (!alreadyInList) {
                    state.userWords.push(newWord);
                }
            }
        });
    },
});

export const { clearState } = appSlice.actions;
export default appSlice.reducer;
