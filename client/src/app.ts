import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Pipe} from '@angular/core';
import {ItemsService, Item, AppStore} from './items';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';

//-------------------------------------------------------------------
// PLACERING-PIPE
//-------------------------------------------------------------------
@Pipe({
    name: 'PlaceringSort'
})
export class PlaceringSort {
    transform(value: Array<Item>): Array<Item> {
        value.sort((a: Item, b: Item) => {
            if (+a.resultTotal < +b.resultTotal) {
                return -1;
            } else if (+a.resultTotal > +b.resultTotal) {
                return 1;
            } else {
                return 0;
            }
        });
        return value;
    }
}

//-------------------------------------------------------------------
// NAME-PIPE
//-------------------------------------------------------------------
@Pipe({
    name: 'NamePipe'
})
export class NamePipe {
    transform(value, args?) {
        let filter = args;
        return value.filter(item => {
            return filter == null || item.name == null || item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
        });
    }
}

//-------------------------------------------------------------------
// CLAZZ-PIPE
//-------------------------------------------------------------------
@Pipe({
    name: 'ClazzPipe'
})
export class ClazzPipe {
    transform(value, args?) {
        let filter = args;
        return value.filter(item => {
            return filter == null || item.clazz == null || item.clazz.toLowerCase().indexOf(filter.toLowerCase()) > -1;
        });
    }
}

//-------------------------------------------------------------------
// GENDER-PIPE
//-------------------------------------------------------------------
@Pipe({
    name: 'GenderPipe'
})
export class GenderPipe {
    transform(value, args?) {
        let filter = args;
        return value.filter(item => {
            return filter == null || item.gender == null || item.gender.toLowerCase().indexOf(filter.toLowerCase()) > -1;
        });
    }
}

//-------------------------------------------------------------------
// ITEMS-LIST
//-------------------------------------------------------------------
@Component({
    selector: 'items-list',
    templateUrl: 'itemList.html',
    pipes: [PlaceringSort, NamePipe, ClazzPipe, GenderPipe]
})
class ItemList {
    name: string;
    clazz: string;
    gender: string;
    @Input() items: Item[];
    @Output() selected = new EventEmitter();
    @Output() deleted = new EventEmitter();

    print() {
        console.log('Print, based on name: ' + this.name + ', class: ' + this.clazz + ', gender: ' + this.gender);
        console.log('Resultat: ' + this.items);
    };
}

//-------------------------------------------------------------------
// ITEM DETAIL
//-------------------------------------------------------------------
@Component({
    selector: 'item-detail',
    templateUrl: 'itemDetail.html'
})
class ItemDetail {
    @Input('item') _item: Item;
    originalName: string;
    selectedItem: Item;
    @Output() saved = new EventEmitter();
    @Output() cancelled = new EventEmitter();

    set _item(value: Item) {
        if (value) this.originalName = value.name;
        this.selectedItem = Object.assign({}, value);
    }
}

//-------------------------------------------------------------------
// MAIN COMPONENT
//-------------------------------------------------------------------
@Component({
    selector: 'my-app',
    providers: [],
    templateUrl: 'main.html',
    directives: [ItemList, ItemDetail],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
    items: Observable<Array<Item>>;
    selectedItem: Observable<Item>;

    constructor(private itemsService: ItemsService, private store: Store<AppStore>) {

    }

    ngOnInit() {
        this.items = this.itemsService.items;
        this.selectedItem = this.store.select('selectedItem');
        this.selectedItem.subscribe(v => console.log(v));

        this.itemsService.loadItems();
    }

    resetItem() {
        let emptyItem: Item = {
            id: null,
            resultTotal: null,
            resultClazz: null,
            resultGender: null,
            name: '',
            clazz: '',
            gender: '',
            resultTime: '',
            medalj: null
        };
        this.store.dispatch({type: 'SELECT_ITEM', payload: emptyItem});
    }

    selectItem(item: Item) {
        this.store.dispatch({type: 'SELECT_ITEM', payload: item});
    }

    saveItem(item: Item) {
        this.itemsService.saveItem(item);

        // Generally, we would want to wait for the result of `itemsService.saveItem`
        // before resetting the current item.
        this.resetItem();
    }

    deleteItem(item: Item) {
        this.itemsService.deleteItem(item);

        // Generally, we would want to wait for the result of `itemsService.deleteItem`
        // before resetting the current item.
        this.resetItem();
    }
}
