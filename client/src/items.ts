import {Http, Headers} from '@angular/http';
import {Store} from '@ngrx/store';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

const BASE_URL = 'http://localhost:8080/cma/rest/resultatlista';
const HEADER = {headers: new Headers({'Content-Type': 'application/json'})};

export interface Item {
    id: number;
    placeringTotal: number;
    placeringClazz: number;
    placeringGender: number;
    name: string;
    clazz: string;
    gender: string;
    totaltime: string;
    medalj: string;
}

export interface AppStore {
    items: Item[];
    selectedItem: Item;
}

//-------------------------------------------------------------------
// ITEMS STORE
//-------------------------------------------------------------------
export const items = (state: any = [], {type, payload}) => {
    let index: number;
    switch (type) {
        case 'ADD_ITEMS':
            return payload;
        case 'CREATE_ITEM':
            return [...state, payload];
        case 'UPDATE_ITEM':
            return state.map(item => {
                return item.id === payload.id ? Object.assign({}, item, payload) : item;
            });
        case 'DELETE_ITEM':
            return state.filter(item => {
                return item.id !== payload.id;
            });
        default:
            return state;
    }
};

//-------------------------------------------------------------------
// SELECTED ITEM STORE
//-------------------------------------------------------------------
export const selectedItem = (state: any = null, {type, payload}) => {
    switch (type) {
        case 'SELECT_ITEM':
            return payload;
        default:
            return state;
    }
};

//-------------------------------------------------------------------
// ITEMS SERVICE
//-------------------------------------------------------------------
@Injectable()
export class ItemsService {
    items: Observable<Array<Item>>;

    constructor(private http: Http, private store: Store<AppStore>) {
        this.items = store.select('items');
    }

    loadItems() {
        this.http.get(BASE_URL)
            .map(res => res.json())
            .map(payload => ({type: 'ADD_ITEMS', payload}))
            .subscribe(action => this.store.dispatch(action));
    }

    deleteItem(item: Item) {
        this.http.delete(`${BASE_URL}${item.id}`)
            .subscribe(action => this.store.dispatch({type: 'DELETE_ITEM', payload: item}));
    }

    saveItem(item: Item) {
        var start = JSON.parse(JSON.stringify(item));
        start.id = null;
        this.http.post(`${BASE_URL}`, JSON.stringify(start), HEADER)
            .map(res => res.json())
            .map(payload => ({type: 'CREATE_ITEM', payload}))
            .subscribe();
    }
}
